var express = require('express');
var app = express();
var path = require('path');
var WanNianLi = require('./lib/wuxing');
var calendar = require('./lib/calendar');
var LunarCalendar = require('lunar-calendar');
var diPanDiZhiList = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"];

var xunShouList = {
    "甲子": "戊",
    "甲戊": "已",
    "甲申": "庚",
    "甲午": "辛",
    "甲辰": "壬",
    "甲寅": "癸"
}
var diPan = {
    "6": "乾",
    "1": "坎",
    "8": "艮",
    "3": "震",
    "4": "巽",
    "9": "离",
    "2": "坤",
    "7": "兑"
}
var men = {
    "6": "开门",
    "1": "休门",
    "8": "生门",
    "3": "伤门",
    "4": "杜门",
    "9": "景门",
    "2": "死门",
    "7": "惊门"
}

var xing = {
    "6": "天心",
    "1": "天蓬",
    "8": "天任",
    "3": "天冲",
    "4": "天辅",
    "9": "天英",
    "2": "天芮",
    "7": "天柱",
    "5": "天禽"
}
var xingList = new Array(
    "天心",
    "天蓬",
    "天任",
    "天冲",
    "天辅",
    "天英",
    "天芮",
    "天柱"
);
// 现时
var now;

var qimen = {}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
// public files
app.use(express.static(path.join(__dirname, 'public')));

// index
app.get('/', function (req, res) {
    now = new Date();
    console.log(now.toLocaleString())
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    // 农历
    var lunar = calendar.solar2lunar(year, month, date);
    lunar.hour = hour;
    // 四柱
    var bazi = WanNianLi.getResult(lunar).bazi;
    // 甲子列表
    var jiazi = WanNianLi.getResult(lunar).jiazi;
    // 旬首
    var xunShou = jiazi[jiazi.indexOf(bazi.hour) - (jiazi.indexOf(bazi.hour) % 10) + 1];
    qimen["xunShou"] = xunShouList[xunShou];
    qimen["shiGan"] = bazi.hour;
    getXing();
    res.render('index', {
        time: year + '/' + month + '/' + date + ' ' + hour + ':' + now.getMinutes(),
        year: bazi.year,
        month: bazi.month,
        date: bazi.date,
        hour: bazi.hour,
        wuxing: WanNianLi.getResult(lunar).wuxing,
        xunshou: xunShou + "-" + xunShouList[xunShou]
    });
});

app.get('/getJieQi', function (req, res) {
    res.send(SolarTerm(now));
});

app.get('/getInfo', function (req, res) {
    res.send(qimen);
});

app.listen(3000, function () {
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
function SolarTerm(DateGL) {
    var SolarTermStr = new Array(
        "小寒-yang-285", "大寒-yang-396", "立春-yang-852", "雨水-yang-963",
        "惊蛰-yang-174", "春分-yang-396", "清明-yang-417", "谷雨-yang-528",
        "立夏-yang-417", "小满-yang-528", "芒种-yang-639", "夏至-yin-936",
        "小暑-yin-825", "大暑-yin-714", "立秋-yin-258", "处暑-yin-147",
        "白露-yin-936", "秋分-yin-714", "寒露-yin-693", "霜降-yin-582",
        "立冬-yin-693", "小雪-yin-582", "大雪-yin-471", "冬至-yang-174");
    var DifferenceInMonth = new Array(
        1272060, 1275495, 1281180, 1289445, 1299225, 1310355,
        1321560, 1333035, 1342770, 1350855, 1356420, 1359045,
        1358580, 1355055, 1348695, 1340040, 1329630, 1318455,
        1306935, 1297380, 1286865, 1277730, 1274550, 1271556);
    var DifferenceInYear = 31556926;
    var BeginTime = new Date(1901 / 1 / 1);
    BeginTime.setTime(947120460000);
    for (; DateGL.getFullYear() < BeginTime.getFullYear();) {
        BeginTime.setTime(BeginTime.getTime() - DifferenceInYear * 1000);
    }
    for (; DateGL.getFullYear() > BeginTime.getFullYear();) {
        BeginTime.setTime(BeginTime.getTime() + DifferenceInYear * 1000);
    }
    for (var M = 0; DateGL.getMonth() > BeginTime.getMonth(); M++) {
        BeginTime.setTime(BeginTime.getTime() + DifferenceInMonth[M] * 1000);
    }
    if (DateGL.getDate() > BeginTime.getDate()) {
        BeginTime.setTime(BeginTime.getTime() + DifferenceInMonth[M] * 1000);
        M++;
    }
    if (DateGL.getDate() > BeginTime.getDate()) {
        BeginTime.setTime(BeginTime.getTime() + DifferenceInMonth[M] * 1000);
        M == 23 ? M = 0 : M++;
    }

    var yuan = "";
    var res = ""
    var diff = Math.ceil((BeginTime.getTime() - DateGL.getTime()) / 86400000);
    console.log(diff)
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
    var data = SolarTermStr[M - 1].split("-");
    if (data[1] == "yin") {
        res = "阴遁" + data[2].split("")[yuan] + " 局";
    } else {
        res = "阳遁" + data[2].split("")[yuan] + " 局";
    }

    var tmp = {
        msg: res,
        '地盘地支': getDiPanDiZhi(data[1] + "-" + data[2].split("")[yuan])
    }
    return JSON.stringify(tmp);
}

/**
 * 阴阳遁-局数
 * yin/yang-N
 * @param {String} info
 */
function getDiPanDiZhi(info) {
    var result = {};
    var type = info.split("-")[0];
    const num = info.split("-")[1];
    if (type == "yin") {
        // 阴遁 逆着排
        for (var i = 0; i < 9; i++) {
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
        for (var i = 1; i < num; i++) {
            result[i] = diPanDiZhiList[9 - num + i];
        }

        // 3. cas num - 9
        for (var i = num; i < 9; i++) {
            result[parseInt(i) + 1] = diPanDiZhiList[i - num + 1];
        }

    }
    return result;
}

/**
 * 拿到星
 */
function getXing() {
    var zhiFuXing = "";
    for (var dizhi in qimen["diPanDiZhi"]) {
        if (qimen["diPanDiZhi"][dizhi] == qimen['xunShou']) {
            zhiFuXing = xing[dizhi];
        }
    }
    var shiGan = qimen["shiGan"].split("")[0];
    var newLuoGong = "";
    for (var t in qimen["diPanDiZhi"]) {
        if (qimen["diPanDiZhi"][t] == shiGan) {
            newLuoGong = t;
        }
    }
    var old = xingList.indexOf(zhiFuXing);
    var offset = newLuoGong - old;
    var tianPanXing = {}
    for (var i = 0; i < xingList.length; i++) {
        tianPanXing[(i + offset + 8) % 8 + 1] = xingList[i];
    }
    qimen["tianPanXing"] = tianPanXing;
}