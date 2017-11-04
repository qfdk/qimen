/**
 * Created by qfdk on 17/11/05.
 */
$(document).ready(function () {
    $.get('/getJieQi', function (data) {
        var json = JSON.parse(data);
        $('#jieQi').text(json.msg);
        var diZhi = json.diPanDiZhi;
        for (var dz in diZhi) {
            $('#diPanDiZhi' + dz).text(diZhi[dz]);
        }
    });
});
