/**
 * Created by qfdk on 16/2/21.
 */
$(document).ready(function(){
    $.get('/getInfo', function (data) {
        $('#email').text(data.email);
        $('#status').text(data.status);
        setTimeout(function(){
            $.get('/getInfoServer', function (data, status) {
                $('#name').text(data.name);
                $('#memory').text(data.memory);
                $('#kernel').text(data.kernel);
            });
        },100);
    });
});

function load() {
    alert('coucou');
}