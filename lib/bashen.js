/**
 * 八神分布计算模块
 */

/**
 * 排布八神
 * @param {String} zhiFuGong 值符宫
 * @returns {Object} 八神分布
 */
function distributeBaShen(zhiFuGong) {
    // 八神基本分布
    const basicGongToShen = {
        '1': '值符',
        '8': '腾蛇',
        '3': '太阴',
        '4': '六合',
        '9': '白虎',
        '2': '玄武',
        '7': '九地',
        '6': '九天',
        '5': '' // 中宫无神
    };
    
    // 八神顺序
    const shenOrder = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
    
    // 宫位顺序（顺时针，不含中宫）
    const clockwiseGongOrder = ['1', '8', '3', '4', '9', '2', '7', '6'];
    
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
        const zhiFuGongIndex = clockwiseGongOrder.indexOf(zhiFuGong);
        
        if (zhiFuGongIndex !== -1) {
            // 从值符宫开始顺时针排列其他神
            for (let i = 1; i < clockwiseGongOrder.length; i++) {
                const currentGong = clockwiseGongOrder[(zhiFuGongIndex + i) % clockwiseGongOrder.length];
                const currentShen = shenOrder[i];
                baShen[currentGong] = currentShen;
            }
        }
    } else {
        // 如果值符在中宫，使用默认排布
        for (const gong in basicGongToShen) {
            baShen[gong] = basicGongToShen[gong];
        }
    }
    
    return baShen;
}

module.exports = {
    distributeBaShen
};
