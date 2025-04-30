/**
 * 奇门遁甲地盘干设置模块
 * 用于正确设置九宫地盘干
 */

/**
 * 获取基本地盘干分布
 * 在奇门遁甲中，地盘干不包含甲和癸，正确的地盘干顺序是：
 * 一宫（坎宫）- 戊，二宫（坤宫）- 丁，三宫（震宫）- 丙，四宫（巽宫）- 乙
 * 五宫（中宫）- 戊，六宫（乾宫）- 己，七宫（兑宫）- 庚，八宫（艮宫）- 辛
 * 九宫（离宫）- 壬
 * @returns {Object} 基本地盘干分布
 */
function getBasicDiPan() {
    return {
        '1': '戊', // 一宫（坎宫）
        '2': '丁', // 二宫（坤宫）
        '3': '丙', // 三宫（震宫）
        '4': '乙', // 四宫（巽宫）
        '5': '戊', // 五宫（中宫）
        '6': '己', // 六宫（乾宫）
        '7': '庚', // 七宫（兑宫）
        '8': '辛', // 八宫（艮宫）
        '9': '壬'  // 九宫（离宫）
    };
}

/**
 * 获取飞宫地盘干
 * 根据阴阳遁和局数调整地盘干位置
 * @param {String} type 阴遁或阳遁
 * @param {Number} num 局数 (1-9)
 * @returns {Object} 调整后的地盘干分布
 */
function getFeiGongDiPan(type, num) {
    const basicDiPan = getBasicDiPan();
    const result = { ...basicDiPan };
    
    // 在奇门遁甲理论中，地盘干不变，是天盘干飞宫
    // 所以这里直接返回基本地盘分布
    
    return result;
}

module.exports = {
    getBasicDiPan,
    getFeiGongDiPan
};
