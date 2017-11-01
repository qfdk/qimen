var express = require('express');
var app = express();
var path = require('path');
var WanNianLi = require('./lib/wuxing');
var calendar = require('./lib/calendar');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
// public files
app.use(express.static(path.join(__dirname, 'public')));

// index
app.get('/', function (req, res) {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();

    var lunar = calendar.solar2lunar(year, month, date);
    lunar.hour = hour;

    var bazi = WanNianLi.getResult(lunar).bazi;
    console.log(WanNianLi.getResult(lunar).wuxing)
    res.render('index', {
        time: now.toLocaleString(),
        year: bazi.year,
        month: bazi.month,
        date: bazi.date,
        hour: bazi.hour,
        wuxing: WanNianLi.getResult(lunar).wuxing
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});