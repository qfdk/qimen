$(document).ready(function() {
    // 设置自定义排盘表单的默认日期和时间
    var now = new Date();
    var dateStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
    var timeStr = String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0');

    $('#date').val(dateStr);
    $('#time').val(timeStr);

    // 自定义排盘表单提交
    $('#submitCustomPan').click(function() {
        $('#customPanForm').submit();
    });

    // 确保九宫格始终保持正方形比例
    function maintainAspectRatio() {
        var gridWidth = $('.pan-grid').width();
        $('.gong').css('height', gridWidth / 3 + 'px');
    }

    maintainAspectRatio();
    $(window).resize(maintainAspectRatio);
});
