/**
 * 奇门遁甲解断引擎
 *
 * 输入 qimen.calculate() 产出的完整盘对象，输出增强解盘分析：
 *   - 宫位级断局：星宫/门宫生克(含门迫)、十干克应、空亡、驿马
 *   - 全盘格局识别：著名克应格局 + 六仪击刑/五不遇时/三奇得使/奇仪入墓/星伏反吟
 *   - 用神取用 + 综合断语
 *
 * 本模块只做断局，不参与排盘，亦不依赖 qimen.js（避免循环依赖），
 * 所需常量在此自带，取值与 qimen.js 中 JIU_XING/BA_MEN/BA_SHEN 保持一致。
 */

const { diPan: GONG_INFO } = require('./constants');

/* ============ 五行基础 ============ */

// a 生 SHENG[a]；a 克 KE[a]
const SHENG = { mu: 'huo', huo: 'tu', tu: 'jin', jin: 'shui', shui: 'mu' };
const KE = { mu: 'tu', tu: 'shui', shui: 'huo', huo: 'jin', jin: 'mu' };
const WUXING_CN = { mu: '木', huo: '火', tu: '土', jin: '金', shui: '水' };

function sheng(a, b) { return !!a && !!b && SHENG[a] === b; }
function ke(a, b) { return !!a && !!b && KE[a] === b; }

/**
 * 以 a 为主体，描述 a 与 b 的五行关系
 * @returns {'比和'|'生出'|'生入'|'克出'|'克入'|''}
 */
function relation(a, b) {
    if (!a || !b) return '';
    if (a === b) return '比和';
    if (SHENG[a] === b) return '生出'; // a 生 b，a 泄
    if (SHENG[b] === a) return '生入'; // b 生 a，a 得生
    if (KE[a] === b) return '克出';   // a 克 b
    if (KE[b] === a) return '克入';   // b 克 a，a 受克
    return '';
}

/* ============ 天干 / 九星 / 八门 / 八神 属性 ============ */

const GAN_WUXING = {
    '甲': 'mu', '乙': 'mu', '丙': 'huo', '丁': 'huo', '戊': 'tu',
    '己': 'tu', '庚': 'jin', '辛': 'jin', '壬': 'shui', '癸': 'shui'
};
// 甲遁于六仪，天/地盘理论上不出现甲；若出现按戊论（甲子戊）
const GAN_YANG = new Set(['甲', '丙', '戊', '庚', '壬']);

const XING_INFO = {
    '天蓬': { element: 'shui', alias: '贪狼', feature: '主智慧、口才、机变' },
    '天芮': { element: 'tu', alias: '武曲', feature: '主稳重、忠厚、坚韧，亦主疾病' },
    '天冲': { element: 'mu', alias: '禄存', feature: '主冲击、变化、快速' },
    '天辅': { element: 'mu', alias: '文曲', feature: '主扶助、文书、辅佐' },
    '天禽': { element: 'tu', alias: '天禽', feature: '中宫之星，主枢纽、核心' },
    '禽芮': { element: 'tu', alias: '天禽', feature: '天禽寄坤宫与天芮同宫，主枢纽、疾病' },
    '天心': { element: 'jin', alias: '廉贞', feature: '主决断、医药、果决' },
    '天柱': { element: 'jin', alias: '破军', feature: '主坚固、口舌、破耗' },
    '天任': { element: 'tu', alias: '巨门', feature: '主责任、稳实、田产' },
    '天英': { element: 'huo', alias: '左辅', feature: '主才华、显贵，亦主血光' }
};

const MEN_INFO = {
    '休门': { element: 'shui', type: 'ji', feature: '吉门，主休养安宁，宜休息谒贵' },
    '生门': { element: 'tu', type: 'ji', feature: '吉门，主生发财喜，宜求财开张' },
    '伤门': { element: 'mu', type: 'xiong', feature: '凶门，主伤损疾病，宜捕猎索债' },
    '杜门': { element: 'mu', type: 'xiong', feature: '凶门，主阻塞隐避，宜躲藏防守' },
    '景门': { element: 'huo', type: 'ji', feature: '吉门(平)，主文书光明，宜考试献策' },
    '死门': { element: 'tu', type: 'xiong', feature: '凶门，主死丧停滞，宜吊丧断事' },
    '惊门': { element: 'jin', type: 'xiong', feature: '凶门，主惊恐口舌，宜诉讼擒拿' },
    '开门': { element: 'jin', type: 'ji', feature: '吉门，主通达开拓，宜开业出行' }
};

const SHEN_INFO = {
    '值符': { type: 'ji', feature: '贵神，主贵人福庆' },
    '腾蛇': { type: 'xiong', feature: '凶神，主虚惊怪异、口舌' },
    '太阴': { type: 'ji', feature: '吉神，主暗助阴贵、谋密' },
    '六合': { type: 'ji', feature: '吉神，主和合婚姻、中介' },
    '白虎': { type: 'xiong', feature: '凶神，主凶伤道路、争斗' },
    '玄武': { type: 'xiong', feature: '凶神，主盗贼欺诈、暗昧' },
    '九地': { type: 'ji', feature: '吉神，主柔顺稳固、藏纳' },
    '九天': { type: 'ji', feature: '吉神，主高远扬名、出行' }
};

const GONG_YI = {
    '1': '坎宫主水，关乎事业、财源、流动、隐秘。',
    '2': '坤宫主土，关乎婚姻、母亲、田宅、众人。',
    '3': '震宫主木，关乎创业、动作、长男、惊扰。',
    '4': '巽宫主木，关乎文书、女子、风评、出行。',
    '5': '中宫为枢，统领八方，关乎自身、核心。',
    '6': '乾宫主金，关乎父亲、权威、官贵、远行。',
    '7': '兑宫主金，关乎口舌、沟通、少女、毁折。',
    '8': '艮宫主土，关乎阻隔、变化、少男、田产。',
    '9': '离宫主火，关乎名声、文书、眼目、光明。'
};

/* ============ 十干克应表（天盘干 + 地盘干，81 组）============ */
// 每项：[格局名, 吉凶('ji'|'xiong'|'ping'), 断语]
const KE_YING = {
    '乙': {
        '乙': ['日奇伏吟', 'xiong', '宜静宜守，不利谒贵'],
        '丙': ['奇仪顺遂', 'ji', '升迁吉利，唯防离别'],
        '丁': ['奇仪相佐', 'ji', '文书事吉，利于合作'],
        '戊': ['利阴害阳', 'xiong', '破财伤人，不利公开'],
        '己': ['日奇入墓', 'xiong', '被土暗昧，门凶事凶'],
        '庚': ['日奇被刑', 'xiong', '争讼财产，夫妻怀私'],
        '辛': ['青龙逃走', 'xiong', '奴仆拐带，女人弃婚'],
        '壬': ['日奇天罗', 'xiong', '尊卑悖乱，官灾是非'],
        '癸': ['日奇地网', 'xiong', '遁迹隐形，躲灾避难']
    },
    '丙': {
        '乙': ['日月并行', 'ji', '阴阳得位，谋为皆吉'],
        '丙': ['月奇悖师', 'xiong', '文书逼迫，破耗遗失'],
        '丁': ['星奇朱雀', 'ji', '文书吉利，宜静守'],
        '戊': ['飞鸟跌穴', 'ji', '木火相生，百事洞彻'],
        '己': ['火悖入刑', 'ping', '囚人刑杖，吉凶看门'],
        '庚': ['荧入太白', 'xiong', '门户破财，盗耗遗失'],
        '辛': ['月奇相合', 'ji', '凶象被合，谋事成就'],
        '壬': ['火入天网', 'xiong', '为客不利，是非颇多'],
        '癸': ['月奇地网', 'xiong', '暗昧不明，阴人害事']
    },
    '丁': {
        '乙': ['玉女生奇', 'ji', '加官进禄，婚姻财喜'],
        '丙': ['星随月转', 'ping', '小人得志，贵人高升'],
        '丁': ['星奇伏吟', 'ji', '文书即至，万事如意'],
        '戊': ['青龙转光', 'ji', '官人升迁，利婚求学'],
        '己': ['火入勾陈', 'xiong', '奸私仇冤，事因女人'],
        '庚': ['星奇受阻', 'ping', '文书阻隔，行人必归'],
        '辛': ['朱雀入狱', 'xiong', '罪人释囚，牢狱之灾'],
        '壬': ['奇仪相合', 'ji', '凡事能成，贵人辅助'],
        '癸': ['朱雀投江', 'xiong', '文书口舌，官府词讼']
    },
    '戊': {
        '乙': ['青龙合会', 'ping', '有贵人助，吉凶看门'],
        '丙': ['青龙返首', 'ji', '大吉大利，唯无吉门则吉事成凶'],
        '丁': ['青龙耀明', 'ji', '谒贵求名皆遂'],
        '戊': ['青龙伏吟', 'xiong', '凡事闭塞，静守为吉'],
        '己': ['贵人入狱', 'ping', '公私不利，方有转机'],
        '庚': ['值符飞宫', 'xiong', '吉事不吉，移换逃迁'],
        '辛': ['青龙折足', 'ping', '吉门可谋，否则足疾折伤'],
        '壬': ['青龙天牢', 'xiong', '诸事不利，测病主凶'],
        '癸': ['青龙华盖', 'ping', '为利而合，吉凶看门']
    },
    '己': {
        '乙': ['地户逢星', 'xiong', '墓神不明，前途渺茫'],
        '丙': ['火悖地户', 'xiong', '男被冤害，感情出轨'],
        '丁': ['朱雀入墓', 'ping', '文书词讼，终可拨云见日'],
        '戊': ['犬遇青龙', 'ping', '门吉可谋，吉凶看门'],
        '己': ['地户逢鬼', 'xiong', '病者必死，不可谋为'],
        '庚': ['刑格反名', 'xiong', '谋为徒劳，谨防谋害'],
        '辛': ['游魂入墓', 'xiong', '人鬼相侵，凡事谨慎'],
        '壬': ['地网高张', 'xiong', '奸情伤杀，事多变动'],
        '癸': ['地刑玄武', 'xiong', '疾病垂危，囚狱词讼']
    },
    '庚': {
        '乙': ['太白逢星', 'xiong', '流连牵绊，夫妻不和'],
        '丙': ['太白入荧', 'ping', '占贼必来，为主破财'],
        '丁': ['金屋藏娇', 'ping', '婚外有情，门吉有救'],
        '戊': ['值符伏宫', 'xiong', '破财伤人，百事皆凶'],
        '己': ['官府刑格', 'xiong', '私欲伤害，主客不利'],
        '庚': ['太白同宫', 'xiong', '官灾横祸，变动争财'],
        '辛': ['白虎干格', 'xiong', '远行不利，诸事灾殃'],
        '壬': ['移荡之格', 'xiong', '远行迷失，多主变动'],
        '癸': ['反吟大格', 'xiong', '行人不至，官司破财']
    },
    '辛': {
        '乙': ['白虎猖狂', 'xiong', '家破人亡，男人弃婚'],
        '丙': ['干合悖师', 'ping', '合中有乱，吉凶看门'],
        '丁': ['狱神得奇', 'ji', '经商倍利，意外收获'],
        '戊': ['困龙被伤', 'xiong', '屈抑守分，官司破财'],
        '己': ['入狱自刑', 'xiong', '奴仆背主，自错破财'],
        '庚': ['白虎出力', 'xiong', '主客相残，退避尚可'],
        '辛': ['伏吟天庭', 'xiong', '公废私就，自罹罪名'],
        '壬': ['凶蛇入狱', 'xiong', '两男争女，先动失理'],
        '癸': ['天牢华盖', 'xiong', '日月失明，动辄乖张']
    },
    '壬': {
        '乙': ['小蛇得势', 'ji', '女子温柔，占孕生子'],
        '丙': ['水蛇入火', 'xiong', '官灾刑禁，两败俱伤'],
        '丁': ['干合蛇刑', 'ping', '文书牵连，男吉女凶'],
        '戊': ['小蛇化龙', 'ji', '升迁得势，女产婴童'],
        '己': ['反吟蛇刑', 'xiong', '官司败诉，顺守可吉'],
        '庚': ['太白擒蛇', 'ping', '难以发展，刑狱公平'],
        '辛': ['螣蛇相缠', 'xiong', '琐事缠绕，被人欺瞒'],
        '壬': ['天狱自刑', 'xiong', '求谋无成，诸事破败'],
        '癸': ['幼女奸淫', 'xiong', '奸私隐情，测婚不正']
    },
    '癸': {
        '乙': ['华盖逢星', 'ping', '贵人禄位，吉凶看门'],
        '丙': ['华盖悖师', 'xiong', '贵贱不利，反复无常'],
        '丁': ['螣蛇夭矫', 'xiong', '口舌是非，火焚难逃'],
        '戊': ['天乙合会', 'ji', '婚姻财喜，合作投资吉'],
        '己': ['华盖地户', 'xiong', '阴阳不和，躲避为吉'],
        '庚': ['太白入网', 'xiong', '吉事成空，自罹罪责'],
        '辛': ['网盖天牢', 'xiong', '官司败诉，测病大凶'],
        '壬': ['复见螣蛇', 'xiong', '嫁娶重婚，不保年华'],
        '癸': ['天网四张', 'xiong', '行人失伴，不可谋为']
    }
};

// 值得在「格局」区块单独提示的著名克应格局
const FAMOUS_KEYING = new Set([
    '青龙返首', '飞鸟跌穴', '荧入太白', '太白入荧', '青龙伏吟', '日奇伏吟',
    '星奇伏吟', '伏吟天庭', '天狱自刑', '天网四张', '太白同宫', '反吟大格',
    '小蛇化龙', '日月并行', '玉女生奇', '青龙逃走', '白虎猖狂', '地户逢鬼',
    '青龙耀明', '天乙合会'
]);

function lookupKeYing(tianGan, diGan) {
    const t = tianGan === '甲' ? '戊' : tianGan;
    const d = diGan === '甲' ? '戊' : diGan;
    const row = KE_YING[t];
    if (!row || !row[d]) return null;
    const [name, ji, explain] = row[d];
    return { name, jiXiong: ji, explain, tianGan, diGan };
}

/* ============ 结构性格局判定常量 ============ */

// 六仪击刑：地盘六仪落入与其地支相刑之宫
const LIUYI_JIXING_GONG = { '戊': '3', '己': '2', '庚': '8', '辛': '9', '壬': '4', '癸': '4' };
// 三奇得使：天盘奇 + 地盘仪
const SANQI_DESHI = new Set(['乙己', '乙辛', '丙戊', '丙庚', '丁壬', '丁癸']);
// 三奇入墓：天盘奇落墓库之宫（木墓未坤2、火墓戌乾6）
const SANQI_RUMU_GONG = { '乙': '2', '丙': '6', '丁': '6' };
// 九星本位与对宫（用于星伏吟/反吟）
const XING_BENWEI = { '天蓬': '1', '天芮': '2', '天冲': '3', '天辅': '4', '天禽': '5', '天心': '6', '天柱': '7', '天任': '8', '天英': '9' };
const DUI_GONG = { '1': '9', '9': '1', '2': '8', '8': '2', '3': '7', '7': '3', '4': '6', '6': '4' };

/* ============ 宫位级断局 ============ */

const JIXIONG_TEXT = { da_ji: '大吉', xiao_ji: '小吉', ping: '平', xiao_xiong: '小凶', da_xiong: '大凶' };

function scoreToLevel(score) {
    if (score >= 2.5) return 'da_ji';
    if (score >= 1) return 'xiao_ji';
    if (score > -1) return 'ping';
    if (score > -2.5) return 'xiao_xiong';
    return 'da_xiong';
}

/**
 * 深度分析单宫
 * @param {String} g 宫位（'1'..'9'）
 * @param {Object} pan calculate 产出的盘对象
 */
function analyzeGongDeep(g, pan) {
    const gInfo = GONG_INFO[g] || {};
    const gongEl = gInfo.element || '';

    const xing = (pan.jiuXing || {})[g] || '';
    const men = (pan.baMen || {})[g] || '';
    const shen = (pan.baShen || {})[g] || '';
    const tianGan = (pan.tianPan || {})[g] || '';
    const diGan = (pan.diPan || {})[g] || '';
    const anGan = (pan.anGan || {})[g] || '';

    const xingInfo = XING_INFO[xing] || {};
    const menInfo = MEN_INFO[men] || {};
    const shenInfo = SHEN_INFO[shen] || {};

    const kongWang = Array.isArray(pan.kongWangGong) && pan.kongWangGong.includes(g);
    const yiMa = pan.maStar && pan.maStar.gong === g;

    let score = 0;

    // 八门吉凶
    if (menInfo.type === 'ji') score += 1;
    else if (menInfo.type === 'xiong') score -= 1;

    // 八神吉凶
    if (shenInfo.type === 'ji') score += 1;
    else if (shenInfo.type === 'xiong') score -= 1;

    // 星宫关系（以星为主体）
    const xingGongRel = relation(xingInfo.element, gongEl);
    if (xingGongRel === '生入') score += 1;       // 宫生星，星得养
    else if (xingGongRel === '比和') score += 0.5;
    else if (xingGongRel === '克入') score -= 1;  // 宫克星，星受制
    else if (xingGongRel === '生出') score += 0.5; // 星生宫

    // 门宫关系（门迫为核心凶象）
    const menGongRel = relation(menInfo.element, gongEl);
    let menPo = false;
    if (menGongRel === '克出') { score -= 2; menPo = true; } // 门克宫 = 门迫
    else if (menGongRel === '克入') score -= 1;              // 宫克门，门受制
    else if (menGongRel === '生入') score += 1;              // 宫生门
    else if (menGongRel === '比和') score += 1;
    else if (menGongRel === '生出') score += 0.5;            // 门生宫

    // 十干克应
    const keYing = lookupKeYing(tianGan, diGan);
    if (keYing) {
        if (keYing.jiXiong === 'ji') score += 1.5;
        else if (keYing.jiXiong === 'xiong') score -= 1.5;
    }

    // 空亡：吉凶力量俱减半
    if (kongWang) score = score * 0.5;

    const jiXiong = scoreToLevel(score);

    const analysis = {
        gongNumber: g,
        gongName: gInfo.name || '',
        direction: gInfo.direction || '',
        element: gongEl,
        xing,
        xingAlias: xingInfo.alias || '',
        xingFeature: xingInfo.feature || '',
        men,
        menFeature: menInfo.feature || '',
        shen,
        shenFeature: shenInfo.feature || '',
        tianGan,
        diGan,
        anGan,
        xingGongRel,
        menGongRel,
        menPo,
        keYing,
        kongWang,
        yiMa,
        score,
        jiXiong,
        jiXiongText: JIXIONG_TEXT[jiXiong]
    };
    analysis.explain = buildExplain(analysis);
    return analysis;
}

function relText(rel, subject, object) {
    switch (rel) {
        case '比和': return `${subject}与${object}比和，气势相通`;
        case '生入': return `${object}生${subject}，得生有力`;
        case '生出': return `${subject}生${object}，泄气耗力`;
        case '克出': return `${subject}克${object}`;
        case '克入': return `${object}克${subject}，受制不利`;
        default: return '';
    }
}

function buildExplain(a) {
    const parts = [];
    parts.push(GONG_YI[a.gongNumber] || '');
    if (a.xing) parts.push(`${a.xing}${a.xingAlias ? '(' + a.xingAlias + ')' : ''}入宫，${a.xingFeature}。`);
    if (a.men) parts.push(`${a.men}临宫，${a.menFeature}。`);
    if (a.shen) parts.push(`${a.shen}临宫，${a.shenFeature}。`);

    // 天地盘干与克应
    if (a.tianGan && a.diGan) {
        let s = `天盘${a.tianGan}加地盘${a.diGan}`;
        if (a.keYing) s += `，为「${a.keYing.name}」(${ {ji:'吉', xiong:'凶', ping:'平'}[a.keYing.jiXiong] || '' })，${a.keYing.explain}`;
        parts.push(s + '。');
    }

    // 星宫 / 门宫关系
    const xg = relText(a.xingGongRel, '星', '宫');
    if (xg) parts.push(xg + '。');
    if (a.menPo) parts.push('门迫(门克宫)，吉门减力、凶门更凶。');
    else {
        const mg = relText(a.menGongRel, '门', '宫');
        if (mg) parts.push(mg + '。');
    }

    if (a.kongWang) parts.push('此宫值空亡，吉凶力量减半，所主之事易落空、宜实不宜虚。');
    if (a.yiMa) parts.push('驿马临宫，主动象、变动、出行远行有利。');

    // 总断
    switch (a.jiXiong) {
        case 'da_ji': parts.push('综断此宫大吉，可主动进取。'); break;
        case 'xiao_ji': parts.push('综断此宫小吉，稳步推进为宜。'); break;
        case 'ping': parts.push('综断此宫平平，按部就班、谨慎行事。'); break;
        case 'xiao_xiong': parts.push('综断此宫小凶，多有阻碍，宜守不宜进。'); break;
        case 'da_xiong': parts.push('综断此宫大凶，险阻重重，宜避其方、避其事。'); break;
    }
    return parts.join(' ');
}

/* ============ 全盘格局识别 ============ */

/**
 * @param {Object} pan calculate 产出的盘对象
 * @returns {Array} [{name, jiXiong, gong, explain}]
 */
function detectGeju(pan) {
    const geju = [];
    const jiuXing = pan.jiuXing || {};
    const tianPan = pan.tianPan || {};
    const diPan = pan.diPan || {};

    for (let i = 1; i <= 9; i++) {
        const g = i.toString();
        if (g === '5') continue; // 中宫寄宫，格局以八宫论
        const tg = tianPan[g];
        const dg = diPan[g];

        // 著名克应格局
        const ky = lookupKeYing(tg, dg);
        if (ky && FAMOUS_KEYING.has(ky.name)) {
            geju.push({ name: ky.name, jiXiong: ky.jiXiong, gong: g, explain: `${(GONG_INFO[g] || {}).name || ''}宫天盘${tg}加地盘${dg}：${ky.explain}` });
        }

        // 三奇得使（吉）
        if (tg && dg && SANQI_DESHI.has(tg + dg)) {
            geju.push({ name: '三奇得使', jiXiong: 'ji', gong: g, explain: `${(GONG_INFO[g] || {}).name || ''}宫${tg}奇得地盘${dg}仪之使，利于用事、有贵助。` });
        }

        // 六仪击刑（凶）—— 看地盘六仪所落之宫
        if (dg && LIUYI_JIXING_GONG[dg] === g) {
            geju.push({ name: '六仪击刑', jiXiong: 'xiong', gong: g, explain: `地盘${dg}仪落${(GONG_INFO[g] || {}).name || ''}宫犯地支相刑，主刑伤、官非、疾病。` });
        }

        // 三奇入墓（凶）—— 天盘奇落其墓库之宫
        if (tg && SANQI_RUMU_GONG[tg] === g) {
            geju.push({ name: '奇仪入墓', jiXiong: 'xiong', gong: g, explain: `${tg}奇入${(GONG_INFO[g] || {}).name || ''}宫之墓，吉不吉、凶不凶，所主之事无力、宜静。` });
        }
    }

    // 五不遇时（凶）：时干克日干且同阴阳（七杀）
    const dayGan = (pan.siZhu && pan.siZhu.day || '').charAt(0);
    const timeGan = (pan.siZhu && pan.siZhu.time || '').charAt(0);
    if (dayGan && timeGan &&
        ke(GAN_WUXING[timeGan], GAN_WUXING[dayGan]) &&
        GAN_YANG.has(timeGan) === GAN_YANG.has(dayGan)) {
        geju.push({ name: '五不遇时', jiXiong: 'xiong', explain: `时干${timeGan}克日干${dayGan}，为五不遇时，如临七杀，用事多不遂，宜谨慎择机。` });
    }

    // 九星伏吟 / 反吟（以八宫论）
    const cells = ['1', '2', '3', '4', '6', '7', '8', '9'];
    let fuCnt = 0, fanCnt = 0;
    for (const g of cells) {
        const x = jiuXing[g];
        if (!x) continue;
        if (XING_BENWEI[x] === g) fuCnt++;
        if (XING_BENWEI[x] === DUI_GONG[g]) fanCnt++;
    }
    if (fuCnt >= 8) geju.push({ name: '九星伏吟', jiXiong: 'xiong', explain: '九星各归本位，主静止、停滞、旧事重现，凡事宜守不宜动。' });
    else if (fanCnt >= 8) geju.push({ name: '九星反吟', jiXiong: 'xiong', explain: '九星尽落对宫，主反复、动荡、事与愿违，谋为多变。' });

    return geju;
}

/* ============ 用神取用 + 综合断语 ============ */

// purpose -> 优先用神（门 / 神 / 星），按序查找其所在宫
const YONG_SHEN_MAP = {
    '事业': { items: [{ kind: 'men', name: '开门' }, { kind: 'shen', name: '值符' }], tip: '事业看开门、值符所临之宫；宫吉门旺则升迁顺遂。' },
    '财运': { items: [{ kind: 'men', name: '生门' }, { kind: 'gan', name: '戊' }], tip: '求财看生门、戊(财星)所临之宫；逢生旺、忌空亡入墓。' },
    '婚姻': { items: [{ kind: 'shen', name: '六合' }, { kind: 'gan', name: '乙' }], tip: '婚姻看六合、乙(婚星)所临之宫；逢吉门相生为成。' },
    '健康': { items: [{ kind: 'xing', name: '天心' }, { kind: 'men', name: '生门' }], tip: '疾病看天心(医)、生门(生气)所临之宫；忌天芮、死门。' },
    '学业': { items: [{ kind: 'xing', name: '天辅' }, { kind: 'men', name: '景门' }], tip: '考学看天辅(文)、景门(文书)所临之宫；逢吉则名扬。' },
    '出行': { items: [{ kind: 'men', name: '开门' }, { kind: 'gan', name: '驿马' }], tip: '出行看开门、驿马所临之宫；忌伤门、杜门。' },
    '失物': { items: [{ kind: 'shen', name: '玄武' }], tip: '失物盗贼看玄武所临之宫；其方位为线索所在。' }
};

function findYongShenGong(pan, item) {
    if (item.kind === 'men') {
        for (let i = 1; i <= 9; i++) if ((pan.baMen || {})[i] === item.name) return i.toString();
    } else if (item.kind === 'shen') {
        for (let i = 1; i <= 9; i++) if ((pan.baShen || {})[i] === item.name) return i.toString();
    } else if (item.kind === 'xing') {
        for (let i = 1; i <= 9; i++) if ((pan.jiuXing || {})[i] === item.name) return i.toString();
    } else if (item.kind === 'gan') {
        if (item.name === '驿马') return pan.maStar && pan.maStar.gong || '';
        for (let i = 1; i <= 9; i++) if ((pan.tianPan || {})[i] === item.name) return i.toString();
    }
    return '';
}

function overallDeep(pan, gongAnalysis, geju) {
    const zhiFuGong = pan.zhiFuGong;
    const zhiShiGong = pan.zhiShiGong;
    const zhiFu = gongAnalysis[zhiFuGong] || {};
    const zhiShi = gongAnalysis[zhiShiGong] || {};
    const zhiFuJX = zhiFu.jiXiong || 'ping';
    const zhiShiJX = zhiShi.jiXiong || 'ping';

    // 总体吉凶：以值符值使为纲
    let overallJiXiong;
    if (zhiFuJX === 'da_ji' && zhiShiJX === 'da_ji') overallJiXiong = 'da_ji';
    else if (zhiFuJX.includes('ji') && zhiShiJX.includes('ji')) overallJiXiong = 'xiao_ji';
    else if (zhiFuJX.includes('xiong') && zhiShiJX.includes('xiong')) overallJiXiong = 'da_xiong';
    else if (zhiFuJX.includes('xiong') || zhiShiJX.includes('xiong')) overallJiXiong = 'xiao_xiong';
    else overallJiXiong = 'ping';

    const purpose = (pan.basicInfo && pan.basicInfo.purpose) || pan.purpose || '综合';

    // 最有利宫位（综合 score）
    let bestGong = '', bestScore = -Infinity;
    for (let i = 1; i <= 9; i++) {
        const g = i.toString();
        const a = gongAnalysis[g];
        if (!a) continue;
        if (a.score > bestScore) { bestScore = a.score; bestGong = g; }
    }

    // 用神取用
    let yongShen = null;
    const cfg = YONG_SHEN_MAP[purpose];
    if (cfg) {
        for (const item of cfg.items) {
            const g = findYongShenGong(pan, item);
            if (g) {
                const a = gongAnalysis[g] || {};
                yongShen = {
                    name: item.name,
                    gong: g,
                    gongName: a.gongName || '',
                    direction: a.direction || '',
                    jiXiong: a.jiXiong || 'ping',
                    jiXiongText: a.jiXiongText || '平',
                    tip: cfg.tip
                };
                break;
            }
        }
    }

    // 建议
    const suggestions = [];
    switch (overallJiXiong) {
        case 'da_ji':
            suggestions.push('值符值使俱吉，时运极佳，可大胆进取、推动要事。');
            break;
        case 'xiao_ji':
            suggestions.push('时运向好，可稳步推进，借贵人之力事半功倍。');
            break;
        case 'ping':
            suggestions.push('时运平平，宜按部就班、不宜冒进。');
            break;
        case 'xiao_xiong':
            suggestions.push('时运欠佳，宜守不宜攻，谨防小人与意外。');
            break;
        case 'da_xiong':
            suggestions.push('值符值使受制，时运不利，宜低调避事、严控风险。');
            break;
    }

    if (bestGong) {
        const a = gongAnalysis[bestGong];
        suggestions.push(`全盘最有利在${a.direction}方(${a.gongName}宫，${a.jiXiongText})，可多往此方位用事。`);
    }

    if (yongShen) {
        suggestions.push(`【用神】${purpose}取${yongShen.name}为用，落${yongShen.direction}方(${yongShen.gongName}宫)，状态${yongShen.jiXiongText}。${yongShen.tip}`);
    }

    // 格局提示并入建议
    const jiGe = geju.filter(x => x.jiXiong === 'ji').map(x => x.name);
    const xiongGe = geju.filter(x => x.jiXiong === 'xiong').map(x => x.name);
    if (jiGe.length) suggestions.push(`本盘见吉格：${[...new Set(jiGe)].join('、')}，可借势而为。`);
    if (xiongGe.length) suggestions.push(`本盘见凶格：${[...new Set(xiongGe)].join('、')}，所涉之事尤须谨慎。`);

    return {
        overallJiXiong,
        overallJiXiongText: JIXIONG_TEXT[overallJiXiong],
        bestGong,
        yongShen,
        suggestions
    };
}

/* ============ 主入口 ============ */

/**
 * 对一张已排好的盘做完整解断
 * @param {Object} pan calculate 产出的盘对象（含 jiuXing/baMen/baShen/tianPan/diPan/anGan
 *                      /kongWangGong/maStar/siZhu/zhiFuGong/zhiShiGong/basicInfo 等）
 * @returns {Object} { jiuGongAnalysis, geju, analysis }
 */
function jieduan(pan) {
    const jiuGongAnalysis = {};
    for (let i = 1; i <= 9; i++) {
        jiuGongAnalysis[i] = analyzeGongDeep(i.toString(), pan);
    }
    const geju = detectGeju(pan);
    const analysis = overallDeep(pan, jiuGongAnalysis, geju);
    return { jiuGongAnalysis, geju, analysis };
}

module.exports = {
    jieduan,
    analyzeGongDeep,
    detectGeju,
    overallDeep,
    lookupKeYing,
    sheng,
    ke,
    relation,
    GAN_WUXING,
    WUXING_CN,
    KE_YING
};
