$(document).ready(function() {
    // 设置自定义排盘表单的默认日期和时间
    var now = new Date();
    var dateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
    var timeStr = String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0');

    $('#date').val(dateStr);
    $('#time').val(timeStr);

    // 自定义排盘表单提交
    $('#submitCustomPan').click(function() {
        $('#customPanForm').submit();
    });

    // 确保九宫格始终保持正方形比例
    function maintainAspectRatio() {
        var gridWidth = $('.pan-grid').width();
        $('.gong').css('height', gridWidth / 3 + 'px');
    }

    maintainAspectRatio();
    $(window).resize(maintainAspectRatio);

    // 一键复制排盘结果
    $('#copyPanBtn').on('click', function() {
        var pan = window.QIMEN_PAN_DATA;
        if (!pan) {
            showToast('排盘数据尚未加载，无法复制', 'err');
            return;
        }
        var text = buildCopyText(pan);
        copyText(text, function(ok) {
            if (ok) {
                showToast('已复制到剪贴板，可直接粘贴分享');
            } else {
                showToast('复制失败，请手动选择页面内容复制', 'err');
            }
        });
    });
});

var JIXIONG_CN = { ji: '吉', xiong: '凶', ping: '平' };

/**
 * 轻提示：固定定位的浮层，不参与文档流，因此不会挤动页面布局
 */
var toastTimer = null;
function showToast(msg, type) {
    var $toast = $('#qmToast');
    if (!$toast.length) {
        $toast = $('<div id="qmToast" class="qm-toast" role="status" aria-live="polite"></div>').appendTo('body');
    }
    $toast.text(msg)
        .removeClass('qm-toast-ok qm-toast-err')
        .addClass(type === 'err' ? 'qm-toast-err' : 'qm-toast-ok');
    $toast[0].offsetWidth;  // 强制重排，连续点击时过渡动画才会重新播放
    $toast.addClass('qm-toast-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
        $toast.removeClass('qm-toast-visible');
    }, 2200);
}

/**
 * 把排盘数据拼成便于分享的纯文本
 */
function buildCopyText(pan) {
    // 按显示宽度补齐（中文/全角占 2 列）
    function dispWidth(s) {
        s = String(s == null ? '' : s);
        var w = 0;
        for (var i = 0; i < s.length; i++) {
            var c = s.charCodeAt(i);
            w += (c >= 0x2E80 && c <= 0x9FFF) ||
                 (c >= 0xAC00 && c <= 0xD7A3) ||
                 (c >= 0xF900 && c <= 0xFAFF) ||
                 (c >= 0xFE30 && c <= 0xFE6F) ||
                 (c >= 0xFF00 && c <= 0xFF60) ||
                 (c >= 0xFFE0 && c <= 0xFFE6) ? 2 : 1;
        }
        return w;
    }
    function padR(s, w) {
        s = String(s == null ? '' : s);
        var d = w - dispWidth(s);
        return d > 0 ? s + new Array(d + 1).join(' ') : s;
    }
    function padC(s, w) {
        s = String(s == null ? '' : s);
        var d = w - dispWidth(s);
        if (d <= 0) return s;
        var l = Math.floor(d / 2);
        return new Array(l + 1).join(' ') + s + new Array(d - l + 1).join(' ');
    }

    var b = pan.basicInfo || {};
    var sz = pan.siZhu || {};
    var js = pan.juShu || {};
    var an = pan.analysis || {};
    var ga = pan.jiuGongAnalysis || {};
    var METHOD_CN = {'时家':'时家奇门','日家':'日家奇门','月家':'月家奇门','年家':'年家奇门'};
    var methodText = METHOD_CN[b.method] || b.method || '';
    var L = [];

    L.push('【奇门遁甲排盘】');
    L.push('公历：' + (b.date || ''));
    L.push('农历：' + (b.lunarDate || ''));
    L.push('四柱：' + [sz.year, sz.month, sz.day, sz.time].filter(Boolean).join(' '));
    L.push('排盘方法：' + methodText + '　排盘类型：' + (b.type || ''));
    L.push('局数：' + (js.fullName || '') + '　旬首：' + (pan.xunShou || ''));
    L.push('值符：' + (pan.zhiFuXing || '') + '(' + (pan.zhiFuGong || '') + '宫)'
         + '　值使：' + (pan.zhiShiMen || '') + '(' + (pan.zhiShiGong || '') + '宫)');
    var kw = (pan.kongWangZhi || []).join('') || '无';
    var ma = (pan.maStar && pan.maStar.zhi) || '无';
    L.push('空亡：' + kw + '　驿马：' + ma + '　运势：' + (an.overallJiXiongText || ''));
    L.push('');

    // 九宫格（屏幕排列：4-9-2 / 3-5-7 / 8-1-6）
    var NUM_CN = {'1':'一','2':'二','3':'三','4':'四','5':'五','6':'六','7':'七','8':'八','9':'九'};
    var layout = [['4','9','2'], ['3','5','7'], ['8','1','6']];
    var CW = 9;
    function cellLines(g) {
        var a = ga[g] || {};
        var name = (a.gongName || '') + (NUM_CN[g] || '');
        var shen = a.shen || '';
        var xing = a.xing || '';
        var men  = a.men || '';
        var td   = a.tianGan && a.diGan ? a.tianGan + '加' + a.diGan : '';
        // 末行：暗干 + 空亡/驿马标记
        var tail = '';
        if (a.anGan) tail += '暗' + a.anGan;
        if (a.kongWang) tail += ' 空';
        if (a.yiMa) tail += ' 马';
        return [
            padC(name, CW),
            padC(shen, CW),
            padC(xing, CW),
            padC(men, CW),
            padC(td, CW),
            padC(tail, CW)
        ];
    }
    function rowBorder(left, mid, right) {
        var seg = new Array(CW + 3).join('─');
        return left + seg + mid + seg + mid + seg + right;
    }
    L.push(rowBorder('┌', '┬', '┐'));
    for (var r = 0; r < layout.length; r++) {
        var cells = layout[r].map(cellLines);
        for (var li = 0; li < 6; li++) {
            L.push('│ ' + cells[0][li] + ' │ ' + cells[1][li] + ' │ ' + cells[2][li] + ' │');
        }
        if (r < layout.length - 1) L.push(rowBorder('├', '┼', '┤'));
    }
    L.push(rowBorder('└', '┴', '┘'));
    L.push('');

    // 格局
    L.push('【格局】');
    if (pan.geju && pan.geju.length) {
        pan.geju.forEach(function(g) {
            var tag = '[' + (JIXIONG_CN[g.jiXiong] || '平') + ']';
            var where = g.gong ? '（' + g.gong + '宫）' : '';
            L.push(tag + ' ' + g.name + where + ' — ' + g.explain);
        });
    } else {
        L.push('本盘未见显著格局。');
    }
    L.push('');

    // 分析与建议
    L.push('【分析与建议】');
    var zf = ga[pan.zhiFuGong] || {};
    var zs = ga[pan.zhiShiGong] || {};
    L.push('值符：' + (pan.zhiFuGong || '') + '宫(' + (zf.gongName || '中') + ')'
         + '，值使：' + (pan.zhiShiGong || '') + '宫(' + (zs.gongName || '中') + ')');
    if (an.bestGong && ga[an.bestGong]) {
        L.push('最有利方位：' + (ga[an.bestGong].direction || '') + '(' + ga[an.bestGong].gongName + '宫)');
    }
    if (an.yongShen) {
        L.push('用神：' + an.yongShen.name + ' 落' + (an.yongShen.direction || '')
             + '(' + (an.yongShen.gongName || '') + '宫)，' + (an.yongShen.jiXiongText || ''));
    }
    if (an.suggestions && an.suggestions.length) {
        an.suggestions.forEach(function(s, i) {
            L.push((i + 1) + '. ' + s);
        });
    }
    L.push('');

    // 九宫详解
    L.push('【九宫详解】');
    for (var gi = 1; gi <= 9; gi++) {
        var a = ga[gi];
        if (!a) continue;
        var head = gi + '宫 ' + (a.gongName || '') + '（' + (a.direction || '') + '）'
                 + (a.jiXiongText || '');
        var elems = [];
        if (a.shen) elems.push(a.shen);
        if (a.xing) elems.push(a.xing + (a.xingAlias ? '(' + a.xingAlias + ')' : ''));
        if (a.men) elems.push(a.men);
        var ganLine = '';
        if (a.tianGan || a.diGan) ganLine = (a.tianGan || '') + '加' + (a.diGan || '');
        if (a.anGan) ganLine += (ganLine ? ' ' : '') + '暗' + a.anGan;
        var tags = [];
        if (a.keYing) tags.push('[' + (JIXIONG_CN[a.keYing.jiXiong] || '平') + ']' + a.keYing.name);
        if (a.menPo) tags.push('门迫');
        if (a.kongWang) tags.push('空亡');
        if (a.yiMa) tags.push('驿马');
        L.push(head + (elems.length ? '｜' + elems.join('·') : '')
                 + (ganLine ? '｜' + ganLine : '')
                 + (tags.length ? '｜' + tags.join(' ') : ''));
        if (a.explain) L.push(a.explain);
        L.push('');
    }

    // AI 看盘提示（随盘复制，约束 AI 严格按本盘解断，勿自行排盘或生造格局）
    var YONGSHEN_TIP = {
        '事业': '事业看开门、值符所临之宫，宫吉门旺则升迁顺遂',
        '财运': '求财看生门、戊(财星)所临之宫，逢生旺吉、忌空亡入墓',
        '婚姻': '婚姻看六合、乙(婚星)所临之宫，逢吉门相生为成',
        '健康': '疾病看天心(医星)、生门所临之宫，忌天芮、死门',
        '学业': '考学看天辅(文星)、景门(文书)所临之宫，逢吉则名扬',
        '出行': '出行看开门、驿马所临之宫，忌伤门、杜门',
        '失物': '失物盗贼看玄武所临之宫，其方位为线索所在',
        '综合': '综合判断以值符值使为纲，结合所问之事取用神'
    };
    var purpose = (b.purpose || '综合');
    var yongshenTip = YONGSHEN_TIP[purpose] || YONGSHEN_TIP['综合'];
    L.push('【AI看盘提示】');
    L.push('以下为茅山派转盘奇门遁甲排盘结果，请严格按以下规则分析，勿自行重新排盘或改动盘内数据：');
    L.push('1. 排盘参数：' + methodText + '，' + (js.fullName || '') + '，值符' + (pan.zhiFuXing || '')
         + '落' + (pan.zhiFuGong || '') + '宫、值使' + (pan.zhiShiMen || '') + '落' + (pan.zhiShiGong || '') + '宫，为全盘纲领。');
    L.push('2. 严格以本盘所列星门神干为准；天禽寄坤二宫(显示"禽芮")，中五宫不排星门神、寄坤二宫论。');
    L.push('3. 吉凶判断规则：');
    L.push('   - 八门：休/生/开/景为吉门，伤/杜/死/惊为凶门；');
    L.push('   - 八神：值符/太阴/六合/九地/九天为吉，腾蛇/白虎/玄武为凶；');
    L.push('   - 门迫(门克宫)为重要凶象，吉门减力、凶门更凶；宫克门则门受制；');
    L.push('   - 空亡之宫吉凶力量减半，所主之事易落空、宜实不宜虚；');
    L.push('   - 驿马临宫主变动、出行、远行有利；');
    L.push('   - 十干克应与格局只按盘中标注判读(如青龙返首、飞鸟跌穴、六仪击刑、五不遇时、奇仪入墓、九星伏吟/反吟等)，勿编造盘外格局。');
    L.push('4. 用神取用：' + yongshenTip + '。');
    L.push('5. 输出要求：先断总体吉凶(以值符值使落宫为纲)，再析用神落宫与关键格局，次论各宫生克，最后给出可执行建议；不确定处明确说明，勿臆断。');

    return L.join('\n');
}

/**
 * 复制文本到剪贴板：优先 Clipboard API，失败回退 execCommand
 */
function copyText(text, cb) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function() {
            cb(true);
        }).catch(function() {
            fallbackCopy(text, cb);
        });
    } else {
        fallbackCopy(text, cb);
    }
}
function fallbackCopy(text, cb) {
    try {
        var ta = document.createElement('textarea');
        ta.value = text;
        // 留在视口内并做成 1px 透明，避免浏览器为了聚焦而滚动页面
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.left = '0';
        ta.style.width = '1px';
        ta.style.height = '1px';
        ta.style.padding = '0';
        ta.style.border = 'none';
        ta.style.opacity = '0';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        if (ta.focus) ta.focus({ preventScroll: true });
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        cb(ok);
    } catch (e) {
        cb(false);
    }
}
