const express = require('express');
const app = express();
const path = require('path');
const HuangLi = require('./lib/wuxing');
const calendar = require('./lib/calendar');

const {xunShouList, diPanDiZhiList, diPan, men, xing, xingList} = require('./lib/constants');

// 现时
let now;

var qimen = {};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
// public files
app.use(express.static(path.join(__dirname, 'public')));

const timeDetail = (now) => {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hour = now.getHours();
    return {year, month, date, hour};
};

// index
app.get('/', function(req, res) {
    now = new Date();
    const {year, month, date, hour} = timeDetail(now);
    // 农历
    const lunar = calendar.solar2lunar(year, month, date);
    lunar.hour = hour;

    // 四柱
    const bazi = HuangLi.getResult(lunar).bazi;
    // 甲子列表
    const jiazi = HuangLi.getResult(lunar).jiazi.filter(e => e);
    // 旬首
    const xunShou = jiazi[jiazi.indexOf(bazi.hour) - (jiazi.indexOf(bazi.hour) % 10)];
    qimen['旬首'] = xunShouList[xunShou];
    qimen['时干'] = bazi.hour;
    set天盘星();
    SolarTerm(now);
    res.render('index', {
        time: year + '/' + month + '/' + date + ' ' + hour + ':' + now.getMinutes(),
        bazi,
        wuxing: HuangLi.getResult(lunar).wuxing,
        xunshou: xunShou + '-' + xunShouList[xunShou]
    });
});

app.get('/getInfo', function(req, res) {
    res.json(qimen);
});

app.listen(3000, function() {
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
 * @param {*现在时间} DateGL
 */
function SolarTerm(inputDate) {
    const SolarTermStr = [
        '小寒-yang-285', '大寒-yang-396', '立春-yang-852', '雨水-yang-963',
        '惊蛰-yang-174', '春分-yang-396', '清明-yang-417', '谷雨-yang-528',
        '立夏-yang-417', '小满-yang-528', '芒种-yang-639', '夏至-yin-936',
        '小暑-yin-825', '大暑-yin-714', '立秋-yin-258', '处暑-yin-147',
        '白露-yin-936', '秋分-yin-714', '寒露-yin-693', '霜降-yin-582',
        '立冬-yin-693', '小雪-yin-582', '大雪-yin-471', '冬至-yang-174'];
    const DifferenceInMonth = [
        1272060, 1275495, 1281180, 1289445, 1299225, 1310355,
        1321560, 1333035, 1342770, 1350855, 1356420, 1359045,
        1358580, 1355055, 1348695, 1340040, 1329630, 1318455,
        1306935, 1297380, 1286865, 1277730, 1274550, 1271556];
    const DifferenceInYear = 31556926;
    const BeginTime = new Date(1901 / 1 / 1);
    BeginTime.setTime(947120460000);
    for (; inputDate.getFullYear() < BeginTime.getFullYear();) {
        BeginTime.setTime(BeginTime.getTime() - DifferenceInYear * 1000);
    }
    for (; inputDate.getFullYear() > BeginTime.getFullYear();) {
        BeginTime.setTime(BeginTime.getTime() + DifferenceInYear * 1000);
    }
    for (var M = 0; inputDate.getMonth() > BeginTime.getMonth(); M++) {
        BeginTime.setTime(BeginTime.getTime() + DifferenceInMonth[M] * 1000);
    }
    if (inputDate.getDate() > BeginTime.getDate()) {
        BeginTime.setTime(BeginTime.getTime() + DifferenceInMonth[M] * 1000);
        M++;
    }
    if (inputDate.getDate() > BeginTime.getDate()) {
        BeginTime.setTime(BeginTime.getTime() + DifferenceInMonth[M] * 1000);
        M == 23 ? M = 0 : M++;
    }

    let yuan = '';
    let res = '';
    let diff = Math.ceil((BeginTime.getTime() - inputDate.getTime()) / 86400000);

    /**
     * 15 天一个循环
     * 1-5 上元 0
     * 5-10 中元 1
     * 11-15 下元 2
     */
    if (diff <= 5) {
        yuan = 0;
    }
    if (diff > 5 && diff <= 10) {
        yuan = 1;
    }
    if (diff > 10) {
        yuan = 2;
    }
    let data = SolarTermStr[M - 1].split('-');
    if (data[1] == 'yin') {
        res = '阴遁' + data[2].split('')[yuan] + ' 局';
    } else {
        res = '阳遁' + data[2].split('')[yuan] + ' 局';
    }
    qimen['地盘地支'] = getDiPanDiZhi(data[1] + '-' + data[2].split('')[yuan]);
    qimen['局'] = res;
}

/**
 * 阴阳遁-局数
 * yin/yang-N
 * @param {String} info
 */
const getDiPanDiZhi = (info) => {
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
function set天盘星() {
    var zhiFuXing = '';
    for (var dizhi in qimen['地盘地支']) {
        if (qimen['地盘地支'][dizhi] == qimen['旬首']) {
            zhiFuXing = xing[dizhi];
        }
    }
    var shiGan = qimen['时干'].split('')[0];
    var newLuoGong = '';
    for (var t in qimen['地盘地支']) {
        if (qimen['地盘地支'][t] == shiGan) {
            newLuoGong = t;
        }
    }
    var old = xingList.indexOf(zhiFuXing);
    var offset = newLuoGong - old;
    var tianPanXing = {};
    for (var i = 0; i < xingList.length; i++) {
        tianPanXing[(i + offset + 8) % 8 + 1] = xingList[i];
    }
    qimen['天盘星'] = tianPanXing;
}
