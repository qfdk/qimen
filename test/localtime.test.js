'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const {readCookie, resolveUserDate} = require('../lib/localtime');
const app = require('../app');

// 固定参照时刻：2026-08-26 19:40:16 UTC，避开各时区夏令时切换窗口
const INSTANT = new Date(Date.UTC(2026, 7, 26, 19, 40, 16));

/**
 * 取本地墙钟各字段，断言与运行机器所在时区无关
 */
function wall(date) {
    return [
        date.getFullYear(), date.getMonth() + 1, date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds()
    ];
}

/* ---------- readCookie ---------- */

test('readCookie 从多值 Cookie 头中取出目标项并解码', () => {
    assert.equal(readCookie('a=1; qmtz=Asia%2FShanghai%7C480; b=2', 'qmtz'), 'Asia/Shanghai|480');
    assert.equal(readCookie('qmtz=Asia%2FShanghai%7C480', 'qmtz'), 'Asia/Shanghai|480');
});

test('readCookie 对缺失、空值与非法编码返回 null', () => {
    assert.equal(readCookie('a=1; b=2', 'qmtz'), null);
    assert.equal(readCookie('', 'qmtz'), null);
    assert.equal(readCookie(undefined, 'qmtz'), null);
    assert.equal(readCookie('qmtz=%E0%A4%A', 'qmtz'), null);
    // qmtzx 不应被当成 qmtz
    assert.equal(readCookie('qmtzx=Asia%2FShanghai%7C480', 'qmtz'), null);
});

/* ---------- 按 IANA 时区名解析 ---------- */

test('时区名优先：东八区取到访客当地墙钟', () => {
    const d = resolveUserDate('qmtz=' + encodeURIComponent('Asia/Shanghai|480'), INSTANT);
    assert.deepEqual(wall(d), [2026, 8, 27, 3, 40, 16]);
});

test('时区名优先：西五区（纽约夏令时）取到访客当地墙钟', () => {
    const d = resolveUserDate('qmtz=' + encodeURIComponent('America/New_York|-240'), INSTANT);
    assert.deepEqual(wall(d), [2026, 8, 26, 15, 40, 16]);
});

test('时区名带非整点偏移（印度 UTC+5:30）也正确', () => {
    const d = resolveUserDate('qmtz=' + encodeURIComponent('Asia/Kolkata|330'), INSTANT);
    assert.deepEqual(wall(d), [2026, 8, 27, 1, 10, 16]);
});

test('时区名优先于 cookie 中的偏移', () => {
    // 偏移写成 0 也应按 Asia/Shanghai 算 +8
    const d = resolveUserDate('qmtz=' + encodeURIComponent('Asia/Shanghai|0'), INSTANT);
    assert.deepEqual(wall(d), [2026, 8, 27, 3, 40, 16]);
});

test('时区名让跨夏令时的陈旧偏移自动纠正', () => {
    // cookie 存于夏令时期间（-240），冬季再访问应按 EST(-300) 还原
    const winter = new Date(Date.UTC(2026, 0, 15, 19, 40, 16));
    const d = resolveUserDate('qmtz=' + encodeURIComponent('America/New_York|-240'), winter);
    assert.deepEqual(wall(d), [2026, 1, 15, 14, 40, 16]);
});

/* ---------- offset 兜底 ---------- */

test('时区名不可用时按偏移分钟兜底', () => {
    // 服务器 ICU 不认识的时区名
    const unknown = resolveUserDate('qmtz=' + encodeURIComponent('Mars/Olympus|480'), INSTANT);
    assert.deepEqual(wall(unknown), [2026, 8, 27, 3, 40, 16]);

    // 浏览器拿不到时区名，只有偏移
    const offsetOnly = resolveUserDate('qmtz=' + encodeURIComponent('|-300'), INSTANT);
    assert.deepEqual(wall(offsetOnly), [2026, 8, 26, 14, 40, 16]);
});

/* ---------- 回退到服务器时间 ---------- */

test('无 cookie 时用服务器时间', () => {
    assert.equal(resolveUserDate(undefined, INSTANT).getTime(), INSTANT.getTime());
    assert.equal(resolveUserDate('a=1', INSTANT).getTime(), INSTANT.getTime());
});

test('cookie 非法或越界时用服务器时间', () => {
    const bad = [
        'qmtz=' + encodeURIComponent('<script>|x'),          // 时区名与偏移都非法
        'qmtz=' + encodeURIComponent('|'),                    // 偏移为空串，不可当作 UTC+0
        'qmtz=' + encodeURIComponent('|900'),                 // 超过 UTC+14:00
        'qmtz=' + encodeURIComponent('|-780'),                // 超过 UTC-12:00
        'qmtz=' + encodeURIComponent('|4.5'),                 // 非整数
        'qmtz=' + encodeURIComponent('A'.repeat(65) + '|abc') // 时区名超长
    ];
    for (const cookie of bad) {
        assert.equal(resolveUserDate(cookie, INSTANT).getTime(), INSTANT.getTime(), cookie);
    }
});

/* ---------- 路由集成 ---------- */

function get(port, path, cookie) {
    return new Promise((resolve, reject) => {
        const headers = cookie ? {Cookie: cookie} : {};
        http.get({port, path, headers}, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (c) => (body += c));
            res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
    });
}

// 从 basicInfo.date（solar.toFullString()）中取出 "YYYY-MM-DD HH:MM:SS"
function panMinutes(pan) {
    const m = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(pan.basicInfo.date);
    assert.ok(m, '未能从 ' + pan.basicInfo.date + ' 解析时间');
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) / 60000;
}

test('/api/qimen 无 date 参数时按 cookie 中的访客时区排盘', async (t) => {
    const server = app.listen(0);
    await new Promise((r) => server.once('listening', r));
    t.after(() => server.close());
    const port = server.address().port;

    // 取一个与运行机器不同的偏移，确保"沿用服务器时间"的实现无法通过
    const localOffset = -new Date().getTimezoneOffset();
    const visitorOffset = localOffset === 480 ? -300 : 480;

    const serverPan = await get(port, '/api/qimen');
    const visitorPan = await get(port, '/api/qimen', 'qmtz=' + encodeURIComponent('|' + visitorOffset));

    const delta = panMinutes(visitorPan) - panMinutes(serverPan);
    // 两次请求间隔极短，允许跨分钟带来的 1 分钟误差
    assert.ok(
        Math.abs(delta - (visitorOffset - localOffset)) <= 1,
        `期望偏移 ${visitorOffset - localOffset} 分钟，实际 ${delta} 分钟`
    );
});

test('/api/qimen 显式传 date/time 时不受访客时区影响', async (t) => {
    const server = app.listen(0);
    await new Promise((r) => server.once('listening', r));
    t.after(() => server.close());
    const port = server.address().port;

    const query = '/api/qimen?date=2026-08-26&time=21:40';
    const a = await get(port, query);
    const b = await get(port, query, 'qmtz=' + encodeURIComponent('Asia/Shanghai|480'));

    assert.equal(a.basicInfo.date, b.basicInfo.date);
    assert.equal(a.siZhu.time, b.siZhu.time);
});
