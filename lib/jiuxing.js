/**
 * 九星分布计算模块
 */

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
    
    // 宫位对应的九星 - 标准布局
    const basicGongToXing = {
        '1': '天蓬', // 天蓬-贪狼
        '8': '天任', // 天任-巨门
        '3': '天冲', // 天冲-禄存
        '4': '天辅', // 天辅-文曲
        '9': '天英', // 天英-廉贞
        '2': '天芮', // 天芮-武曲
        '7': '天柱', // 天柱-破军
        '6': '天心', // 天心-左辅
        '5': '天禽'  // 天禽在中宫
    };
    
    // 确定值符星
    const zhiFuXing = basicGongToXing[zhiFuGong];
    
    // 九星顺序（不含天禽）
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
            // 从值符宫开始顺时针排列其他星
            for (let i = 1; i < gongOrder.length; i++) {
                const currentGong = gongOrder[(zhiFuGongIndex + i) % gongOrder.length];
                const currentXing = xingOrder[(zhiFuXingIndex + i) % xingOrder.length];
                jiuXing[currentGong] = currentXing;
            }
        }
    } else {
        // 如果值符在中宫，使用基本排布
        for (const gong in basicGongToXing) {
            if (gong !== '5') {  // 中宫已经设置为天禽
                jiuXing[gong] = basicGongToXing[gong];
            }
        }
    }
    
    return {
        zhiFuGong,
        zhiFuXing,
        jiuXing
    };
}

module.exports = {
    distributeJiuXing
};
