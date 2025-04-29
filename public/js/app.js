$(document).ready(function() {
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
