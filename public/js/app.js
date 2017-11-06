/**
 * Created by qfdk on 17/11/05.
 */
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
    "7": "天柱"
}

$(document).ready(function () {
    $.get('/getJieQi', function (data) {
        var json = JSON.parse(data);
        $('#jieQi').text(json.msg);
        var diZhi = json.diPanDiZhi;
        /**
         * 地盘-地支
         */
        for (var dz in diZhi) {
            $('#diPanDiZhi' + dz).text(diZhi[dz]);
        }

    });
    $.get('/getInfo', function (data) {
        var index = $('.diPanDiZhi').text().split("").indexOf(data.xunShou);
        console.log("值符", xing[index]);
        console.log("值使", men[index]);
        for (var index in data.tianPanXing) {
            $('#xing' + index).text(data.tianPanXing[index]);
            if (data.tianPanXing[index] == "天芮") {
                $('#tianqin' + index).text("天禽");
                $('#wu' + index).text("　戊");
            }
        }
    });
});
