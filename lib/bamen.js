/**
 * 八门分布计算模块
 * 转盘排法：八门从值符宫整体转动到时干落宫
 */

// 洛书九宫顺序（不含中宫5）
const LUO_SHU_ORDER = ['1', '8', '3', '4', '9', '2', '7', '6'];

// 八门原位分布（按洛书顺序）
const BASIC_MEN = {
    '1': '休门',
    '8': '生门',
    '3': '伤门',
    '4': '杜门',
    '9': '景门',
    '2': '死门',
    '7': '惊门',
    '6': '开门',
    '5': '' // 中宫无门
};

/**
 * 排布八门（转盘排法）
 * @param {String} zhiFuGong 值符宫
 * @param {String} shiGan 时干
 * @param {Object} diPan 地盘干分布
 * @param {String} type 阴阳遁类型（可选，用于确定转动方向）
 * @returns {Object} 八门分布和值使信息
 */
function distributeBaMen(zhiFuGong, shiGan, diPan, type = 'yang') {
    // 1. 确定值使门 = 值符宫原位的门
    const zhiShiMen = BASIC_MEN[zhiFuGong] || '';

    // 2. 查找时干在地盘上的位置 = 时干落宫
    let luoGong = '';
    for (const gong in diPan) {
        if (diPan[gong] === shiGan && gong !== '5') {
            luoGong = gong;
            break;
        }
    }

    // 如果找不到时干（甲隐于六仪之下），用值符宫
    if (!luoGong) {
        // 甲隐于旬首六仪之下，落宫就是值符宫
        luoGong = zhiFuGong;
    }

    // 3. 计算八门转动
    const baMen = {};
    baMen['5'] = ''; // 中宫无门

    const zhiFuIndex = LUO_SHU_ORDER.indexOf(zhiFuGong);
    const luoGongIndex = LUO_SHU_ORDER.indexOf(luoGong);

    if (zhiFuIndex === -1 || luoGongIndex === -1) {
        // 如果找不到，返回原位
        return {
            zhiShiGong: luoGong,
            zhiShiMen,
            baMen: { ...BASIC_MEN }
        };
    }

    // 计算转动步数（从值符宫到时干落宫）
    const steps = (luoGongIndex - zhiFuIndex + 8) % 8;

    // 八门整体顺时针转动
    for (let i = 0; i < 8; i++) {
        const originalGong = LUO_SHU_ORDER[i];
        const originalMen = BASIC_MEN[originalGong];

        // 转动后的宫位
        const newIndex = (i + steps) % 8;
        const newGong = LUO_SHU_ORDER[newIndex];

        baMen[newGong] = originalMen;
    }

    return {
        zhiShiGong: luoGong,
        zhiShiMen,
        baMen
    };
}

module.exports = {
    distributeBaMen
};
