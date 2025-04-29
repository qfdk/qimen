/**
 * 奇门遁甲核心计算库
 * 实现完整的奇门遁甲排盘系统
 */

const {Lunar, Solar, JieQi} = require('lunar-javascript');

/**
 * 天干地支对应
 */
const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 三奇六仪(天盘)
 */
const SAN_QI = ["戊", "己", "庚"];
const LIU_YI = ["辛", "壬", "癸", "丁", "丙", "乙"];

/**
 * 九宫位置信息
 */
const JIU_GONG = {
    '1': { name: '坎', direction: '正北', element: 'shui', color: '#03A9F4', yinyang: '阴' },
    '2': { name: '坤', direction: '西南', element: 'tu', color: '#795548', yinyang: '阴' },
    '3': { name: '震', direction: '正东', element: 'mu', color: '#4CAF50', yinyang: '阳' },
    '4': { name: '巽', direction: '东南', element: 'mu', color: '#4CAF50', yinyang: '阳' },
    '5': { name: '中', direction: '中宫', element: 'tu', color: '#795548', yinyang: '阴阳' },
    '6': { name: '乾', direction: '西北', element: 'jin', color: '#FF9800', yinyang: '阳' },
    '7': { name: '兑', direction: '正西', element: 'jin', color: '#FF9800', yinyang: '阴' },
    '8': { name: '艮', direction: '东北', element: 'tu', color: '#795548', yinyang: '阳' },
    '9': { name: '离', direction: '正南', element: 'huo', color: '#F44336', yinyang: '阳' }
};

/**
 * 九星信息
 */
const JIU_XING = {
    '天蓬': { alias: '贪狼', element: 'shui', color: '#03A9F4', feature: '主智慧、口才、机变' },
    '天芮': { alias: '武曲', element: 'tu', color: '#795548', feature: '主稳重、忠厚、坚韧' },
    '天冲': { alias: '禄存', element: 'mu', color: '#4CAF50', feature: '主冲击、变化、快速' },
    '天辅': { alias: '文曲', element: 'mu', color: '#4CAF50', feature: '主扶助、支持、辅佐' },
    '天禽': { alias: '天禽', element: 'tu', color: '#795548', feature: '为中宫之神，主枢纽、核心' },
    '天心': { alias: '廉贞', element: 'jin', color: '#FF9800', feature: '主决断、判断、果决' },
    '天柱': { alias: '破军', element: 'jin', color: '#FF9800', feature: '主坚固、支撑、顶天立地' },
    '天任': { alias: '巨门', element: 'tu', color: '#795548', feature: '主责任、重担、实际' },
    '天英': { alias: '左辅', element: 'huo', color: '#F44336', feature: '主才华、聪明、显贵' }
};

/**
 * 八门信息
 */
const BA_MEN = {
    '休门': { feature: '为吉门，主休养、安宁、平和。适合休息与调养。', type: 'ji', element: 'shui', color: '#03A9F4' },
    '生门': { feature: '为吉门，主生发、成长、喜庆。适合开始新事物。', type: 'ji', element: 'mu', color: '#4CAF50' },
    '伤门': { feature: '为凶门，主伤害、损失、疾病。需避免冲突与伤害。', type: 'xiong', element: 'mu', color: '#4CAF50' },
    '杜门': { feature: '为凶门，主阻塞、停滞、困难。事情易受阻碍。', type: 'xiong', element: 'tu', color: '#795548' },
    '景门': { feature: '为吉门，主光明、展示、明亮。适合公开场合与展示。', type: 'ji', element: 'huo', color: '#F44336' },
    '死门': { feature: '为凶门，主衰败、结束、死亡。不宜开始重要事情。', type: 'xiong', element: 'tu', color: '#795548' },
    '惊门': { feature: '为凶门，主惊吓、变故、突发状况。需注意意外变化。', type: 'xiong', element: 'jin', color: '#FF9800' },
    '开门': { feature: '为吉门，主通达、顺畅、开始。万事顺利，有好的开端。', type: 'ji', element: 'jin', color: '#FF9800' }
};

/**
 * 八神信息
 */
const BA_SHEN = {
    '值符': { feature: '为贵神，主吉庆、贵人、福星。', type: 'ji' },
    '腾蛇': { feature: '为凶神，主口舌是非、波动起伏。', type: 'xiong' },
    '太阴': { feature: '为吉神，主柔和、隐藏、内敛。', type: 'ji' },
    '六合': { feature: '为吉神，主和谐、团结、合作。', type: 'ji' },
    '白虎': { feature: '为凶神，主凶猛、伤害、灾祸。', type: 'xiong' },
    '玄武': { feature: '为凶神，主隐秘、盗窃、欺诈。', type: 'xiong' },
    '九地': { feature: '为吉神，主地利、丰收、稳固。', type: 'ji' },
    '九天': { feature: '为吉神，主高升、贵人、成功。', type: 'ji' }
};

/**
 * 节气与局数的映射关系
 */
const JIE_QI_JU_SUAN = [
    { jieqi: '冬至', type: 'yang', numbers: '174' },
    { jieqi: '惊蛰', type: 'yang', numbers: '174' },
    { jieqi: '小寒', type: 'yang', numbers: '285' },
    { jieqi: '大寒', type: 'yang', numbers: '396' },
    { jieqi: '春分', type: 'yang', numbers: '396' },
    { jieqi: '雨水', type: 'yang', numbers: '963' },
    { jieqi: '清明', type: 'yang', numbers: '417' },
    { jieqi: '立夏', type: 'yang', numbers: '417' },
    { jieqi: '立春', type: 'yang', numbers: '852' },
    { jieqi: '谷雨', type: 'yang', numbers: '528' },
    { jieqi: '小满', type: 'yang', numbers: '528' },
    { jieqi: '芒种', type: 'yang', numbers: '639' },
    { jieqi: '夏至', type: 'yin', numbers: '936' },
    { jieqi: '白露', type: 'yin', numbers: '936' },
    { jieqi: '小暑', type: 'yin', numbers: '825' },
    { jieqi: '大暑', type: 'yin', numbers: '714' },
    { jieqi: '秋分', type: 'yin', numbers: '714' },
    { jieqi: '立秋', type: 'yin', numbers: '258' },
    { jieqi: '寒露', type: 'yin', numbers: '693' },
    { jieqi: '立冬', type: 'yin', numbers: '693' },
    { jieqi: '处暑', type: 'yin', numbers: '147' },
    { jieqi: '霜降', type: 'yin', numbers: '582' },
    { jieqi: '小雪', type: 'yin', numbers: '582' },
    { jieqi: '大雪', type: 'yin', numbers: '471' }
];

/**
 * 计算阴阳遁局数
 * @param {Date} date 日期时间
 * @param {String} method 排盘方法：'时家', '日家', '月家', '年家'
 * @returns {Object} 局数信息
 */
function calculateJuShu(date, method = '时家') {
    // 使用lunar-javascript获取当前节气信息
    const lunar = Lunar.fromDate(date);
    
    // 根据排盘方法选择不同的时间单位
    let jieQiName;
    if (method === '时家' || method === '日家') {
        // 获取最近的节气
        jieQiName = lunar.getPrevJieQi(true).getName();
    } else if (method === '月家') {
        // 获取当月的节气
        jieQiName = lunar.getJieQiList()[lunar.getMonth() * 2].getName();
    } else if (method === '年家') {
        // 获取当年的立春
        const year = lunar.getYear();
        const liChun = Lunar.fromYmd(year, 2, 4).getPrevJieQi(true); // 立春一般在2月4日前后
        jieQiName = liChun.getName();
    }
    
    // 确定上中下元 (简化处理，使用日期的日子来确定)
    // 每个节气约15天，分为三元，每元5天
    const day = lunar.getDay();
    let yuan;
    
    if (day <= 10) {
        yuan = 0; // 上元
    } else if (day <= 20) {
        yuan = 1; // 中元
    } else {
        yuan = 2; // 下元
    }
    
    // 查找当前节气对应的局数
    let yinYangType = 'yang';
    let juNumber = '1';
    
    // 在映射中查找当前节气
    for (const item of JIE_QI_JU_SUAN) {
        if (item.jieqi === jieQiName) {
            yinYangType = item.type;
            juNumber = item.numbers.charAt(yuan);
            break;
        }
    }
    
    return {
        jieQiName: jieQiName,
        type: yinYangType,
        number: juNumber,
        yuan: ['上元', '中元', '下元'][yuan],
        fullName: `${yinYangType === 'yin' ? '阴遁' : '阳遁'}${juNumber}局 (${['上元', '中元', '下元'][yuan]})`,
        formatCode: `${yinYangType}-${juNumber}`
    };
}

/**
 * 根据阴阳遁和局数排布三奇六仪
 * @param {Object} juShuInfo 局数信息对象
 * @returns {Object} 三奇六仪分布
 */
function distributeSanQiLiuYi(juShuInfo) {
    const type = juShuInfo.type;
    const num = parseInt(juShuInfo.number);
    const result = {};
    
    // 三奇六仪的排布顺序
    const allQiYi = [...SAN_QI, ...LIU_YI];
    
    // 阴阳遁规则
    if (type === 'yin') {
        // 阴遁：逆时针排列
        // 戊己庚三奇放在中宫和阴遁局数宫
        result['5'] = '戊'; // 中宫永远是戊
        
        // 确定己和庚的位置
        const startPos = 10 - num; // 阴遁数 = 10 - 阳遁数
        
        // 宫位顺序（逆时针，不含中宫）：1, 9, 8, 7, 6, 4, 2, 3
        const gongOrder = ['1', '9', '8', '7', '6', '4', '2', '3'];
        
        // 从起始位置开始逆时针排列三奇六仪
        for (let i = 0; i < gongOrder.length; i++) {
            const index = (startPos + i) % 8; // 调整索引
            result[gongOrder[i]] = allQiYi[(index + 1) % 9]; // +1 是因为戊已经在中宫
        }
    } else {
        // 阳遁：顺时针排列
        // 戊己庚三奇放在中宫和阳遁局数宫
        result['5'] = '戊'; // 中宫永远是戊
        
        // 根据局数确定起始位置
        const startPos = num;
        
        // 宫位顺序（顺时针，不含中宫）：9, 8, 7, 6, 4, 2, 3, 1
        const gongOrder = ['9', '8', '7', '6', '4', '2', '3', '1'];
        
        // 从起始位置开始顺时针排列三奇六仪
        for (let i = 0; i < gongOrder.length; i++) {
            const index = (startPos + i) % 8; // 调整索引
            result[gongOrder[i]] = allQiYi[(index + 1) % 9]; // +1 是因为戊已经在中宫
        }
    }
    
    return result;
}

/**
 * 排布九星
 * @param {Object} sanQiLiuYi 三奇六仪分布
 * @param {String} xunShou 旬首
 * @returns {Object} 九星分布和值符信息
 */
function distributeJiuXing(sanQiLiuYi, xunShou) {
    // 查找旬首所在宫
    let zhiFuGong = '';
    for (const gong in sanQiLiuYi) {
        if (sanQiLiuYi[gong] === xunShou) {
            zhiFuGong = gong;
            break;
        }
    }
    
    // 如果找不到旬首，默认在中宫
    if (!zhiFuGong) {
        zhiFuGong = '5';
    }
    
    // 宫位对应的九星
    const gongToXing = {
        '1': '天蓬',
        '2': '天芮',
        '3': '天冲',
        '4': '天辅',
        '5': '天禽',
        '6': '天心',
        '7': '天柱',
        '8': '天任',
        '9': '天英'
    };
    
    // 确定值符星
    const zhiFuXing = gongToXing[zhiFuGong];
    
    // 九星顺序
    const xingOrder = ['天蓬', '天任', '天冲', '天辅', '天英', '天芮', '天柱', '天心'];
    
    // 宫位顺序（顺时针，不含中宫）
    const gongOrder = ['1', '8', '3', '4', '9', '2', '7', '6'];
    
    // 九星分布结果
    const jiuXing = {};
    
    // 中宫永远是天禽
    jiuXing['5'] = '天禽';
    
    // 值符星在值符宫
    if (zhiFuGong !== '5') {
        jiuXing[zhiFuGong] = zhiFuXing;
        
        // 找到值符星在星序中的位置
        const zhiFuXingIndex = xingOrder.indexOf(zhiFuXing);
        
        // 值符宫在宫序中的位置
        const zhiFuGongIndex = gongOrder.indexOf(zhiFuGong);
        
        if (zhiFuXingIndex !== -1 && zhiFuGongIndex !== -1) {
            // 从值符宫开始按顺序排列其他星
            for (let i = 1; i < gongOrder.length; i++) {
                const currentGong = gongOrder[(zhiFuGongIndex + i) % gongOrder.length];
                const currentXing = xingOrder[(zhiFuXingIndex + i) % xingOrder.length];
                jiuXing[currentGong] = currentXing;
            }
        }
    } else {
        // 如果值符在中宫，使用默认排布
        for (let i = 0; i < gongOrder.length; i++) {
            jiuXing[gongOrder[i]] = xingOrder[i];
        }
    }
    
    return {
        zhiFuGong,
        zhiFuXing,
        jiuXing
    };
}

/**
 * 排布八门
 * @param {String} zhiFuGong 值符宫
 * @param {String} shiGan 时干
 * @param {Object} sanQiLiuYi 三奇六仪分布
 * @returns {Object} 八门分布和值使信息
 */
function distributeBaMen(zhiFuGong, shiGan, sanQiLiuYi) {
    // 查找时干落宫
    let luoGong = '';
    for (const gong in sanQiLiuYi) {
        if (sanQiLiuYi[gong] === shiGan) {
            luoGong = gong;
            break;
        }
    }
    
    // 如果找不到时干，查找时干寄宫
    if (!luoGong) {
        // 甲己寄生在戊，乙庚寄生在己，丙辛寄生在庚...
        const jiShengMap = {
            '甲': '戊', '己': '戊',
            '乙': '己', '庚': '己',
            '丙': '庚', '辛': '庚',
            '丁': '辛', '壬': '辛',
            '戊': '壬', '癸': '壬'
        };
        
        const jiGan = jiShengMap[shiGan];
        for (const gong in sanQiLiuYi) {
            if (sanQiLiuYi[gong] === jiGan) {
                luoGong = gong;
                break;
            }
        }
    }
    
    // 宫位对应的八门
    const gongToMen = {
        '1': '休门',
        '2': '死门',
        '3': '伤门',
        '4': '杜门',
        '6': '开门',
        '7': '惊门',
        '8': '生门',
        '9': '景门'
    };
    
    // 确定值使门
    const zhiShiMen = gongToMen[zhiFuGong] || '';
    
    // 宫位顺序（不含中宫）
    const gongOrder = ['1', '8', '3', '4', '9', '2', '7', '6'];
    
    // 八门顺序
    const menOrder = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];
    
    // 八门分布结果
    const baMen = {};
    
    // 中宫没有门
    baMen['5'] = '';
    
    // 如果时干落宫找到
    if (luoGong && luoGong !== '5') {
        // 值使门落在时干所在宫
        baMen[luoGong] = zhiShiMen;
        
        // 找到值使门在门序中的位置
        const zhiShiMenIndex = menOrder.indexOf(zhiShiMen);
        
        // 时干落宫在宫序中的位置
        const luoGongIndex = gongOrder.indexOf(luoGong);
        
        if (zhiShiMenIndex !== -1 && luoGongIndex !== -1) {
            // 排列其他门
            for (let i = 1; i < gongOrder.length; i++) {
                const currentGong = gongOrder[(luoGongIndex + i) % gongOrder.length];
                const currentMen = menOrder[(zhiShiMenIndex + i) % menOrder.length];
                baMen[currentGong] = currentMen;
            }
        }
    } else {
        // 如果找不到落宫或落宫在中宫，使用默认排布
        for (let i = 0; i < gongOrder.length; i++) {
            baMen[gongOrder[i]] = menOrder[i];
        }
    }
    
    return {
        zhiShiGong: luoGong,
        zhiShiMen,
        baMen
    };
}

/**
 * 排布八神
 * @param {String} zhiFuGong 值符宫
 * @returns {Object} 八神分布
 */
function distributeBaShen(zhiFuGong) {
    // 八神顺序
    const shenOrder = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
    
    // 宫位顺序（不含中宫）
    const gongOrder = ['1', '8', '3', '4', '9', '2', '7', '6'];
    
    // 八神分布结果
    const baShen = {
        '1': '',
        '2': '',
        '3': '',
        '4': '',
        '5': '', // 中宫没有神
        '6': '',
        '7': '',
        '8': '',
        '9': ''
    };
    
    // 值符在值符宫
    if (zhiFuGong !== '5') {
        baShen[zhiFuGong] = '值符';
        
        // 值符宫在宫序中的位置
        const zhiFuGongIndex = gongOrder.indexOf(zhiFuGong);
        
        if (zhiFuGongIndex !== -1) {
            // 从值符宫开始按顺序排列其他神
            for (let i = 1; i < gongOrder.length; i++) {
                const currentGong = gongOrder[(zhiFuGongIndex + i) % gongOrder.length];
                const currentShen = shenOrder[i];
                baShen[currentGong] = currentShen;
            }
        }
    } else {
        // 如果值符在中宫，使用默认排布
        for (let i = 0; i < gongOrder.length; i++) {
            baShen[gongOrder[i]] = shenOrder[i];
        }
    }
    
    return baShen;
}

/**
 * 获取旬首
 * @param {Lunar} lunar 农历对象
 * @param {String} method 排盘方法
 * @returns {String} 旬首
 */
function getXunShou(lunar, method) {
    let xun = '';
    
    try {
        if (method === '时家') {
            xun = lunar.getTimeXun() || '';
            return xun.charAt(0) || '戊'; // 返回天干部分
        } else if (method === '日家') {
            xun = lunar.getDayXun() || '';
            return xun.charAt(0) || '戊';
        } else if (method === '月家') {
            xun = lunar.getMonthXun() || '';
            return xun.charAt(0) || '戊';
        } else if (method === '年家') {
            xun = lunar.getYearXun() || '';
            return xun.charAt(0) || '戊';
        }
    } catch (e) {
        console.error('获取旬首出错:', e);
    }
    
    // 默认返回戊
    return '戊';
}

/**
 * 获取落宫干支
 * @param {Lunar} lunar 农历对象
 * @param {String} method 排盘方法
 * @returns {String} 干支
 */
function getLuoGongGanZhi(lunar, method) {
    try {
        if (method === '时家') {
            return lunar.getTimeInGanZhi().substring(0, 1); // 只取时干
        } else if (method === '日家') {
            return lunar.getDayInGanZhi().substring(0, 1); // 只取日干
        } else if (method === '月家') {
            return lunar.getMonthInGanZhi().substring(0, 1); // 只取月干
        } else if (method === '年家') {
            return lunar.getYearInGanZhi().substring(0, 1); // 只取年干
        }
    } catch (e) {
        console.error('获取干支出错:', e);
    }
    
    // 默认返回甲
    return '甲';
}

/**
 * 分析宫位吉凶
 * @param {Number} gongNumber 宫位数字
 * @param {Object} jiuXing 九星分布
 * @param {Object} baMen 八门分布
 * @param {Object} baShen 八神分布
 * @returns {Object} 宫位分析结果
 */
function analyzeGong(gongNumber, jiuXing, baMen, baShen) {
    const gongStr = gongNumber.toString();
    const xing = jiuXing[gongStr] || '';
    const men = baMen[gongStr] || '';
    const shen = baShen[gongStr] || '';
    
    // 基本宫位信息
    const gongInfo = JIU_GONG[gongStr] || {};
    
    // 九星信息
    const xingInfo = xing ? JIU_XING[xing] || {} : {};
    
    // 八门信息
    const menInfo = men ? BA_MEN[men] || {} : {};
    
    // 八神信息
    const shenInfo = shen ? BA_SHEN[shen] || {} : {};
    
    // 判断宫位吉凶
    let jiXiong = 'ping'; // 默认平
    let jiXiongScore = 0;
    
    // 根据九星判断
    if (xingInfo.element === 'jin' || xingInfo.element === 'huo') {
        jiXiongScore += 1; // 金火为吉
    } else if (xingInfo.element === 'tu') {
        jiXiongScore += 0; // 土为平
    } else {
        jiXiongScore -= 1; // 水木为凶
    }
    
    // 根据八门判断
    if (men && menInfo.type === 'ji') {
        jiXiongScore += 1; // 吉门
    } else if (men && menInfo.type === 'xiong') {
        jiXiongScore -= 1; // 凶门
    }
    
    // 根据八神判断
    if (shen && shenInfo.type === 'ji') {
        jiXiongScore += 1; // 吉神
    } else if (shen && shenInfo.type === 'xiong') {
        jiXiongScore -= 1; // 凶神
    }
    
    // 最终吉凶判断
    if (jiXiongScore >= 2) {
        jiXiong = 'da_ji'; // 大吉
    } else if (jiXiongScore === 1) {
        jiXiong = 'xiao_ji'; // 小吉
    } else if (jiXiongScore === 0) {
        jiXiong = 'ping'; // 平
    } else if (jiXiongScore === -1) {
        jiXiong = 'xiao_xiong'; // 小凶
    } else {
        jiXiong = 'da_xiong'; // 大凶
    }
    
    // 宫位分析
    const analysis = {
        gongNumber: gongStr,
        gongName: gongInfo.name || '',
        direction: gongInfo.direction || '',
        element: gongInfo.element || '',
        xing: xing,
        xingAlias: xingInfo.alias || '',
        xingFeature: xingInfo.feature || '',
        men: men,
        menFeature: menInfo.feature || '',
        shen: shen,
        shenFeature: shenInfo.feature || '',
        jiXiong: jiXiong,
        jiXiongText: ['大凶', '小凶', '平', '小吉', '大吉'][jiXiongScore + 2],
        explain: generateGongExplanation(gongStr, gongInfo, xing, xingInfo, men, menInfo, shen, shenInfo, jiXiong)
    };
    
    return analysis;
}

/**
 * 生成宫位解释文字
 * @param {String} gongStr 宫位数字字符串
 * @param {Object} gongInfo 宫位信息
 * @param {String} xing 九星名
 * @param {Object} xingInfo 九星信息
 * @param {String} men 八门名
 * @param {Object} menInfo 八门信息
 * @param {String} shen 八神名
 * @param {Object} shenInfo 八神信息
 * @param {String} jiXiong 吉凶等级
 * @returns {String} 解释文字
 */
function generateGongExplanation(gongStr, gongInfo, xing, xingInfo, men, menInfo, shen, shenInfo, jiXiong) {
    const gongExplain = {
        '1': "坎宫主水，与事业、财运、流动资金有关。",
        '2': "坤宫主土，与婚姻、母亲、女性长辈有关。",
        '3': "震宫主木，与创业、开始、长子有关。",
        '4': "巽宫主木，与女性、柔和、文书有关。",
        '5': "中宫为核心，统领八方，与自身状态有关。",
        '6': "乾宫主金，与父亲、权威、领导有关。",
        '7': "兑宫主金，与口舌、沟通、少女有关。",
        '8': "艮宫主土，与停止、障碍、少男有关。",
        '9': "离宫主火，与名声、眼睛、光明有关。"
    };
    
    // 基本宫位解释
    let explanation = gongExplain[gongStr] || "此宫位信息缺失。";
    
    // 添加九星解释
    if (xing) {
        explanation += ` ${xing}${xingInfo.alias ? '(' + xingInfo.alias + ')' : ''}入${gongStr}宫，${xingInfo.feature || ''}`;
    }
    
    // 添加八门解释
    if (men) {
        explanation += ` ${men}入${gongStr}宫，${menInfo.feature || ''}`;
    }
    
    // 添加八神解释
    if (shen) {
        explanation += ` ${shen}入${gongStr}宫，${shenInfo.feature || ''}`;
    }
    
    // 根据吉凶添加解释
    switch (jiXiong) {
        case 'da_ji':
            explanation += " 此宫大吉，事情进展顺利，可主动出击。";
            break;
        case 'xiao_ji':
            explanation += " 此宫小吉，事情有贵人相助，稳步推进为宜。";
            break;
        case 'ping':
            explanation += " 此宫平常，事情进展一般，需谨慎行事。";
            break;
        case 'xiao_xiong':
            explanation += " 此宫小凶，事情多有阻碍，宜守不宜进。";
            break;
        case 'da_xiong':
            explanation += " 此宫大凶，事情多有险阻，最好避开此方位活动。";
            break;
    }
    
    return explanation;
}

/**
 * 综合分析奇门盘
 * @param {Object} jiuGongAnalysis 九宫分析结果
 * @param {String} zhiFuGong 值符宫
 * @param {String} zhiShiGong 值使宫
 * @param {String} purpose 排盘目的
 * @returns {Object} 综合分析结果
 */
function overallAnalysis(jiuGongAnalysis, zhiFuGong, zhiShiGong, purpose) {
    // 值符、值使宫的吉凶
    const zhiFuJiXiong = jiuGongAnalysis[zhiFuGong] ? jiuGongAnalysis[zhiFuGong].jiXiong : 'ping';
    const zhiShiJiXiong = jiuGongAnalysis[zhiShiGong] ? jiuGongAnalysis[zhiShiGong].jiXiong : 'ping';
    
    // 判断总体吉凶
    let overallJiXiong;
    if (zhiFuJiXiong === 'da_ji' && zhiShiJiXiong === 'da_ji') {
        overallJiXiong = 'da_ji';
    } else if (zhiFuJiXiong.includes('ji') && zhiShiJiXiong.includes('ji')) {
        overallJiXiong = 'xiao_ji';
    } else if (zhiFuJiXiong.includes('xiong') && zhiShiJiXiong.includes('xiong')) {
        overallJiXiong = 'da_xiong';
    } else if (zhiFuJiXiong.includes('xiong') || zhiShiJiXiong.includes('xiong')) {
        overallJiXiong = 'xiao_xiong';
    } else {
        overallJiXiong = 'ping';
    }
    
    // 根据目的找出最有利的宫位
    let bestGong = '';
    let bestScore = -3;
    
    for (const gong in jiuGongAnalysis) {
        const analysis = jiuGongAnalysis[gong];
        let score = 0;
        
        // 根据吉凶评分
        switch (analysis.jiXiong) {
            case 'da_ji': score += 2; break;
            case 'xiao_ji': score += 1; break;
            case 'ping': break;
            case 'xiao_xiong': score -= 1; break;
            case 'da_xiong': score -= 2; break;
        }
        
        // 根据目的加分
        if (purpose === '事业' && ['1', '6', '9'].includes(gong)) {
            score += 1;
        } else if (purpose === '财运' && ['1', '7', '6'].includes(gong)) {
            score += 1;
        } else if (purpose === '婚姻' && ['2', '7', '9'].includes(gong)) {
            score += 1;
        } else if (purpose === '健康' && ['3', '9', '4'].includes(gong)) {
            score += 1;
        } else if (purpose === '学业' && ['4', '9', '3'].includes(gong)) {
            score += 1;
        }
        
        // 更新最佳宫位
        if (score > bestScore) {
            bestScore = score;
            bestGong = gong;
        }
    }
    
    // 生成建议
    let suggestions = [];
    
    switch (overallJiXiong) {
        case 'da_ji':
            suggestions.push("当前时运极佳，可大胆行事，推进重要计划。");
            suggestions.push("贵人运强，适合社交活动和寻求支持。");
            suggestions.push("财运亨通，可考虑投资或财务规划。");
            break;
        case 'xiao_ji':
            suggestions.push("时运较好，可稳步推进计划，但需谨慎。");
            suggestions.push("有贵人相助，但也需自身努力。");
            suggestions.push("财运平稳，宜守不宜进。");
            break;
        case 'ping':
            suggestions.push("时运平平，宜按部就班行事，不宜冒险。");
            suggestions.push("人际关系一般，需多加维护。");
            suggestions.push("财运一般，宜节制开支。");
            break;
        case 'xiao_xiong':
            suggestions.push("时运不佳，宜守不宜进，避免冒险。");
            suggestions.push("谨防小人，保持低调。");
            suggestions.push("财务宜节约，避免大额支出。");
            break;
        case 'da_xiong':
            suggestions.push("当前时运不佳，宜避开重要活动，保持低调。");
            suggestions.push("谨防小人和突发事件，避免冲突。");
            suggestions.push("财务宜严格控制，避免任何投资和大额支出。");
            break;
    }
    
    // 根据最佳宫位添加具体建议
    if (bestGong) {
        const bestGongInfo = jiuGongAnalysis[bestGong];
        suggestions.push(`最有利方位在${bestGongInfo.direction}方(${bestGongInfo.gongName}宫)，可多往此方位活动。`);
        
        if (purpose === '事业') {
            suggestions.push("事业方面，注重稳扎稳打，积累经验和人脉，时机成熟再大展拳脚。");
        } else if (purpose === '财运') {
            suggestions.push("财运方面，建议稳健理财，避免投机，重视积累和长期规划。");
        } else if (purpose === '婚姻') {
            suggestions.push("婚姻方面，注重沟通和理解，创造和谐的家庭氛围。");
        } else if (purpose === '健康') {
            suggestions.push("健康方面，注意作息规律，适当运动，保持心情愉快。");
        } else if (purpose === '学业') {
            suggestions.push("学业方面，制定合理计划，坚持不懈，善于利用资源和请教他人。");
        }
    }
    
    return {
        overallJiXiong,
        overallJiXiongText: {
            'da_ji': '大吉',
            'xiao_ji': '小吉',
            'ping': '平',
            'xiao_xiong': '小凶',
            'da_xiong': '大凶'
        }[overallJiXiong],
        bestGong,
        suggestions
    };
}

/**
 * 计算奇门遁甲盘
 * @param {Date} date 日期时间
 * @param {Object} options 选项
 * @returns {Object} 排盘结果
 */
function calculate(date, options = {}) {
    const defaultOptions = {
        type: '四柱', // 三元或四柱
        method: '时家', // 时家, 日家, 月家, 年家
        purpose: '综合', // 事业, 财运, 婚姻, 健康, 学业, 综合
        location: '默认位置'
    };
    
    const opts = { ...defaultOptions, ...options };
    
    try {
        // 获取农历信息
        const lunar = Lunar.fromDate(date);
        const solar = Solar.fromDate(date);
        
        // 获取四柱
        const siZhu = {
            year: lunar.getYearInGanZhi(),
            month: lunar.getMonthInGanZhi(),
            day: lunar.getDayInGanZhi(),
            time: lunar.getTimeInGanZhi()
        };
        
        // 计算局数
        const juShu = calculateJuShu(date, opts.method);
        
        // 获取旬首
        const xunShou = getXunShou(lunar, opts.method);
        
        // 获取落宫干
        const luoGongGan = getLuoGongGanZhi(lunar, opts.method);
        
        // 排布三奇六仪
        const sanQiLiuYi = distributeSanQiLiuYi(juShu);
        
        // 排布九星
        const jiuXingResult = distributeJiuXing(sanQiLiuYi, xunShou);
        
        // 排布八门
        const baMenResult = distributeBaMen(jiuXingResult.zhiFuGong, luoGongGan, sanQiLiuYi);
        
        // 排布八神
        const baShen = distributeBaShen(jiuXingResult.zhiFuGong);
        
        // 分析九宫吉凶
        const jiuGongAnalysis = {};
        for (let i = 1; i <= 9; i++) {
            jiuGongAnalysis[i] = analyzeGong(i, jiuXingResult.jiuXing, baMenResult.baMen, baShen);
        }
        
        // 综合分析
        const analysis = overallAnalysis(jiuGongAnalysis, jiuXingResult.zhiFuGong, baMenResult.zhiShiGong, opts.purpose);
        
        // 创建地盘干映射 (根据天盘干生成对应的地盘干)
        const diPan = {
            '1': '甲',
            '2': '乙',
            '3': '丙',
            '4': '丁',
            '5': '戊',
            '6': '己',
            '7': '庚',
            '8': '辛',
            '9': '壬'
        };
        
        // 整合结果
        return {
            basicInfo: {
                date: solar.toFullString(),
                lunarDate: lunar.toString(),
                type: opts.type,
                method: opts.method,
                purpose: opts.purpose,
                location: opts.location
            },
            siZhu,
            juShu,
            xunShou,
            luoGongGan,
            sanQiLiuYi,
            jiuXing: jiuXingResult.jiuXing,
            baMen: baMenResult.baMen,
            baShen,
            diPan, // 添加地盘干
            zhiFuGong: jiuXingResult.zhiFuGong,
            zhiFuXing: jiuXingResult.zhiFuXing,
            zhiShiGong: baMenResult.zhiShiGong,
            zhiShiMen: baMenResult.zhiShiMen,
            jiuGongAnalysis,
            analysis
        };
    } catch (e) {
        console.error('奇门遁甲计算出错:', e);
        
        // 返回一个基本的错误对象
        return {
            error: true,
            message: e.message,
            basicInfo: {
                date: date.toLocaleString(),
                type: opts.type,
                method: opts.method,
                purpose: opts.purpose,
                location: opts.location
            }
        };
    }
}

// 导出模块
module.exports = {
    calculate,
    JIU_GONG,
    JIU_XING,
    BA_MEN,
    BA_SHEN
};
