const express = require('express');
const app = express();
const path = require('path');

const {Lunar, Solar} = require('lunar-javascript');
const {xunShouMap, diPanDiZhiList, xing, xingList} = require('./lib/constants');

const qimen = {};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
// public files
app.use(express.static(path.join(__dirname, 'public')));
app.disable('view cache');

/**
 * 获取四柱
 * @param date 时间 new Date()
 */
const getSiZhu = (LUNAR) => {
    return {
        year: LUNAR.getYearInGanZhi(),
        month: LUNAR.getMonthInGanZhi(),
        day: LUNAR.getDayInGanZhi(),
        time: LUNAR.getTimeInGanZhi()
    };
};

const getXunshou = (LUNAR) => {
    return LUNAR.getTimeXun();
};

// index
app.get('/', (req, res) => {
    const LUNAR = Lunar.fromDate(new Date());
    // 获取当时四柱
    const sizhu = getSiZhu(LUNAR);

    // 旬首
    const xunShou = getXunshou(LUNAR);
    qimen['旬首'] = xunShouMap[xunShou];
    qimen['时干'] = sizhu.time;

    // set局数(now);
    // 计算局数 考虑传参数进来
    qimen['局'] = "阳-5";
    qimen['地盘地支'] = get地盘地支(qimen['局']);
    set天盘星();
    res.render('index', {
        time: Solar.fromDate(new Date()).toFullString(),
        sizhu,
        xunshou: xunShou + '-' + xunShouMap[xunShou]
    });
});

app.get('/getInfo', (req, res) => {
    res.json(qimen);
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});

/**
 * 阳遁：
 * 冬至、惊蛰一七四，小寒二八五，
 * 大寒、春分三九六，雨水九六三，
 * 清明、立夏四一七，立春八五二，
 * 谷雨、小满五二八，芒种六三九。
 * 阴遁：
 * 夏至、白露九三六，小暑八二五，
 * 大暑、秋分七一四，立秋二五八，
 * 寒露、立冬六九三，处暑一四七，
 * 霜降、小雪五八二，大雪四七一。
 * 茅山法 15日 按照节气来
 * @param {*现在时间} inputDate
 */
// const set局数 = (inputDate) => {
//     const JuMapping = [
//         '小寒-yang-285', '大寒-yang-396', '立春-yang-852', '雨水-yang-963',
//         '惊蛰-yang-174', '春分-yang-396', '清明-yang-417', '谷雨-yang-528',
//         '立夏-yang-417', '小满-yang-528', '芒种-yang-639', '夏至-yin-936',
//         '小暑-yin-825', '大暑-yin-714', '立秋-yin-258', '处暑-yin-147',
//         '白露-yin-936', '秋分-yin-714', '寒露-yin-693', '霜降-yin-582',
//         '立冬-yin-693', '小雪-yin-582', '大雪-yin-471', '冬至-yang-174'];
//
//     const DifferenceInMonth = [
//         1272060, 1275495, 1281180, 1289445, 1299225, 1310355,
//         1321560, 1333035, 1342770, 1350855, 1356420, 1359045,
//         1358580, 1355055, 1348695, 1340040, 1329630, 1318455,
//         1306935, 1297380, 1286865, 1277730, 1274550, 1271556];
//     const DifferenceInYear = 31556926;
//     const BeginTime = new Date(1901 / 1 / 1);
//     BeginTime.setTime(947120460000);
//     for (; inputDate.getFullYear() < BeginTime.getFullYear();) {
//         BeginTime.setTime(BeginTime.getTime() - DifferenceInYear * 1000);
//     }
//     for (; inputDate.getFullYear() > BeginTime.getFullYear();) {
//         BeginTime.setTime(BeginTime.getTime() + DifferenceInYear * 1000);
//     }
//     for (var M = 0; inputDate.getMonth() > BeginTime.getMonth(); M++) {
//         BeginTime.setTime(BeginTime.getTime() + DifferenceInMonth[M] * 1000);
//     }
//
//     if (inputDate.getDate() > BeginTime.getDate()) {
//         BeginTime.setTime(BeginTime.getTime() + DifferenceInMonth[M] * 1000);
//         M == 23 ? M = 0 : M++;
//     }
//
//     let yuan = '';
//     let ju = '';
//     let diff = Math.ceil((inputDate.getTime() - BeginTime.getTime()) / 86400000);
//
//     /**
//      * 15 天一个循环
//      * 1-5 上元 0
//      * 5-10 中元 1
//      * 11-15 下元 2
//      */
//     if (diff <= 5) {
//         yuan = 0;
//     }
//     if (diff > 5 && diff <= 10) {
//         yuan = 1;
//     }
//     if (diff > 10) {
//         yuan = 2;
//     }
//
//     let data = JuMapping[(M - 1) < 0 ? M - 1 + 24 : M].split('-');
//     if (data[1] == 'yin') {
//         ju = '阴遁' + data[2].split('')[yuan] + ' 局';
//     } else {
//         ju = '阳遁' + data[2].split('')[yuan] + ' 局';
//     }
//     qimen['地盘地支'] = get地盘地支(data[1] + '-' + data[2].split('')[yuan]);
//     qimen['局'] = ju;
// };

/**
 * 阴阳遁-局数
 * yin/yang-N
 * @param {String} info
 */
const get地盘地支 = (info) => {
    let i;
    const result = {};
    const type = info.split('-')[0];
    const num = info.split('-')[1];
    if (type === 'yin') {
        // 阴遁 逆着排
        for (i = 0; i < 9; i++) {
            if (i < num) {
                result[num - i] = diPanDiZhiList[i];

            } else {
                result[num - i + 9] = diPanDiZhiList[i];
            }
        }
    } else {
        // 阳遁 顺着排

        // 1. cas
        result[num] = diPanDiZhiList[0];

        // 2. cas 1 - num
        for (i = 1; i < num; i++) {
            result[i] = diPanDiZhiList[9 - num + i];
        }

        // 3. cas num - 9
        for (i = num; i < 9; i++) {
            result[parseInt(i) + 1] = diPanDiZhiList[i - num + 1];
        }

    }
    return result;
};

/**
 * 拿到星
 */
const set天盘星 = () => {
    let zhiFuXing = '';
    for (const dizhi in qimen['地盘地支']) {
        if (qimen['地盘地支'][dizhi] === qimen['旬首']) {
            zhiFuXing = xing[dizhi];
        }
    }
    const shiGan = qimen['时干'].split('')[0];
    let newLuoGong = '';
    for (const t in qimen['地盘地支']) {
        if (qimen['地盘地支'][t] === shiGan) {
            newLuoGong = t;
        }
    }
    const old = xingList.indexOf(zhiFuXing);
    const offset = newLuoGong - old;
    const tianPanXing = {};
    for (let i = 0; i < xingList.length; i++) {
        tianPanXing[(i + offset + 8) % 8 + 1] = xingList[i];
    }
    qimen['天盘星'] = tianPanXing;
};
