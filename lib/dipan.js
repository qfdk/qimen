/**
 * 奇门遁甲地盘干设置模块
 * 地盘干根据局数排布，是固定不动的底盘
 */

// 三奇六仪顺序（9个）
const SAN_QI_LIU_YI = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];

// 洛书九宫飞宫顺序（不含中宫5）
const LUO_SHU_ORDER = ['1', '8', '3', '4', '9', '2', '7', '6'];

/**
 * 根据阴阳遁和局数计算地盘干分布
 * @param {String} type 'yang' 阳遁 或 'yin' 阴遁
 * @param {Number} num 局数 (1-9)
 * @returns {Object} 地盘干分布
 */
function getDiPan(type, num) {
    const result = {};

    if (type === 'yang') {
        // 阳遁：戊从局数宫开始，按洛书顺序顺排
        let startGong = num.toString();
        if (num === 5) startGong = '2'; // 中宫寄坤2宫

        const startIndex = LUO_SHU_ORDER.indexOf(startGong);

        for (let i = 0; i < 8; i++) {
            const gongIndex = (startIndex + i) % 8;
            const gong = LUO_SHU_ORDER[gongIndex];
            result[gong] = SAN_QI_LIU_YI[i];
        }

        // 中宫寄坤2宫
        result['5'] = result['2'];

    } else {
        // 阴遁：戊从局数宫开始，按九宫数字递减顺序排布（包含中宫5）
        // 阴遁2局顺序：2→1→9→8→7→6→5→4→3
        // 对应：戊→己→庚→辛→壬→癸→丁→丙→乙
        let currentGong = num;

        for (let i = 0; i < 9; i++) {
            result[currentGong.toString()] = SAN_QI_LIU_YI[i];

            // 递减，遇到1后跳到9
            currentGong--;
            if (currentGong === 0) currentGong = 9;
        }
    }

    return result;
}

/**
 * 获取基本地盘干分布（阳遁1局的默认分布，保留兼容性）
 * @returns {Object} 基本地盘干分布
 */
function getBasicDiPan() {
    return getDiPan('yang', 1);
}

/**
 * 获取飞宫地盘干（保留兼容性，实际调用 getDiPan）
 * @param {String} type 阴遁或阳遁
 * @param {Number} num 局数 (1-9)
 * @returns {Object} 调整后的地盘干分布
 */
function getFeiGongDiPan(type, num) {
    return getDiPan(type, num);
}

module.exports = {
    getBasicDiPan,
    getFeiGongDiPan,
    getDiPan
};
