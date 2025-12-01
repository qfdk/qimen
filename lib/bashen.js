/**
 * 八神分布计算模块
 */

/**
 * 排布八神
 * @param {String} zhiFuGong 值符宫
 * @param {String} type 阴阳遁类型 'yang' 或 'yin'
 * @returns {Object} 八神分布
 */
function distributeBaShen(zhiFuGong, type = 'yang') {
    // 八神顺序
    const shenOrder = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];

    // 洛书顺序（顺时针）
    const clockwiseOrder = ['1', '8', '3', '4', '9', '2', '7', '6'];
    // 逆时针顺序
    const counterClockwiseOrder = ['1', '6', '7', '2', '9', '4', '3', '8'];

    // 根据阴阳遁选择排布方向
    // 阳遁顺时针，阴遁逆时针
    const gongOrder = type === 'yang' ? clockwiseOrder : counterClockwiseOrder;

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
        // 如果值符在中宫，寄坤2宫
        baShen['2'] = '值符';
        const zhiFuGongIndex = gongOrder.indexOf('2');
        for (let i = 1; i < gongOrder.length; i++) {
            const currentGong = gongOrder[(zhiFuGongIndex + i) % gongOrder.length];
            const currentShen = shenOrder[i];
            baShen[currentGong] = currentShen;
        }
    }

    return baShen;
}

module.exports = {
    distributeBaShen
};
