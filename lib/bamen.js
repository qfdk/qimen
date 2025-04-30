/**
 * 八门分布计算模块
 */

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
    
    // 基本八门分布
    const basicGongToMen = {
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
    
    // 确定值使门
    const zhiShiMen = basicGongToMen[luoGong] || '';
    
    // 宫位顺序（顺时针，不含中宫）
    const clockwiseGongOrder = ['1', '8', '3', '4', '9', '2', '7', '6'];
    
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
        const luoGongIndex = clockwiseGongOrder.indexOf(luoGong);
        
        if (zhiShiMenIndex !== -1 && luoGongIndex !== -1) {
            // 排列其他门
            for (let i = 1; i < clockwiseGongOrder.length; i++) {
                const currentGong = clockwiseGongOrder[(luoGongIndex + i) % clockwiseGongOrder.length];
                const currentMen = menOrder[(zhiShiMenIndex + i) % menOrder.length];
                baMen[currentGong] = currentMen;
            }
        }
    } else {
        // 如果找不到落宫或落宫在中宫，使用默认排布
        for (const gong in basicGongToMen) {
            baMen[gong] = basicGongToMen[gong];
        }
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
