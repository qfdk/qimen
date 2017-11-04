var express = require('express');
var app = express();
var path = require('path');
var WanNianLi = require('./lib/wuxing');
var calendar = require('./lib/calendar');
var LunarCalendar = require('lunar-calendar');
var diPanDiZhi = new Array("戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙");
// 现时
var now = new Date();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
// public files
app.use(express.static(path.join(__dirname, 'public')));

// index
app.get('/', function (req, res) {
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    // 农历
    var lunar = calendar.solar2lunar(year, month, date);
    lunar.hour = hour;
    // 四柱
    var bazi = WanNianLi.getResult(lunar).bazi;

    res.render('index', {
        time: now.toLocaleString(),
        year: bazi.year,
        month: bazi.month,
        date: bazi.date,
        hour: bazi.hour,
        wuxing: WanNianLi.getResult(lunar).wuxing
    });
});

app.get('/getJieQi', function (req, res) {
    res.send(SolarTerm(now));
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
    var diff = Math.floor((BeginTime.getTime() - DateGL.getTime()) / 86400000);
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
        diPanDiZhi: getDiPanDiZhi(data[1] + "-" + data[2].split("")[yuan])
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
    var num = info.split("-")[1];
    if (type == "yin") {
        for (var i = 0; i < 9; i++) {
            if (i < num) {
                result[num - i] = diPanDiZhi[i];

            } else {
                result[num - i + 9] = diPanDiZhi[i];
            }
        }
    } else {
        for (var i = num; i < 9; i++) {
            if ((num + i) > 9) {
                result[(num + i) % 9] = diPanDiZhi[i];
            } else {
                result[num + i] = diPanDiZhi[i];
            }
        }
    }
    return result;
}