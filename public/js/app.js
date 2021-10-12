/**
 * Created by qfdk on 17/11/05.
 */
var diPan = {
    '6': '乾',
    '1': '坎',
    '8': '艮',
    '3': '震',
    '4': '巽',
    '9': '离',
    '2': '坤',
    '7': '兑'
};
var men = {
    '6': '开门',
    '1': '休门',
    '8': '生门',
    '3': '伤门',
    '4': '杜门',
    '9': '景门',
    '2': '死门',
    '7': '惊门'
};

var xing = {
    '6': '天心',
    '1': '天蓬',
    '8': '天任',
    '3': '天冲',
    '4': '天辅',
    '9': '天英',
    '2': '天芮',
    '7': '天柱'
};
var xingType = {
    '天心': 'jin',
    '天蓬': 'shui',
    '天任': 'tu',
    '天冲': 'mu',
    '天辅': 'mu',
    '天英': 'huo',
    '天芮': 'tu',
    '天柱': 'jin'
};
var dizhiType = {
    '戊': 'tu',
    '己': 'tu',
    '庚': 'jin',
    '辛': 'jin',
    '壬': 'shui',
    '癸': 'shui',
    '丁': 'huo',
    '丙': 'huo',
    '乙': 'mu'
};

$(document).ready(function() {
    $.get('/getInfo', function(data) {
        $('#jieQi').text(data['局']);
        var dipanDizhiList = data['地盘地支'];
        for (var index in data['天盘星']) {
            $('#xing' + index).text(data['天盘星'][index]);
            $('#xing' + index).addClass(xingType[data['天盘星'][index]]);
            if (data['天盘星'][index] === '天芮') {
                $('#tianqin' + index).text('天禽');
            }
        }
        /**
         * 地盘-地支
         */
        for (var dz in dipanDizhiList) {
            if (data['旬首'] === dipanDizhiList[dz]) {
                console.log('值符', xing[dz]);
                console.log('值使', men[dz]);
            }
            $('#diPanDiZhi' + dz).text(dipanDizhiList[dz]);
            $('#diPanDiZhi' + dz).addClass(dizhiType[dipanDizhiList[dz]]);
        }
    });
});
