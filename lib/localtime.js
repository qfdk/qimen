/**
 * 访客本地时间解析
 *
 * 实时排盘原本取服务器墙钟（线上为 Europe/Paris），异地访客拿到的时辰会整体偏移。
 * 前端把浏览器时区写入 qmtz cookie（格式 `IANA时区名|与UTC的偏移分钟数`），
 * 这里据此把"此刻"还原成访客所在地的墙钟时间，再交给排盘计算。
 */

'use strict';

const COOKIE_NAME = 'qmtz';

// IANA 时区名的合法字符集，限长以挡掉畸形 cookie
const TZ_NAME_RE = /^[A-Za-z0-9_+/-]{1,64}$/;

// 偏移分钟数：UTC-12:00 ~ UTC+14:00
const OFFSET_RE = /^-?\d{1,4}$/;
const OFFSET_MIN = -720;
const OFFSET_MAX = 840;

/**
 * 从 Cookie 请求头中取出指定 cookie 的值
 * @param {String} cookieHeader req.headers.cookie
 * @param {String} name cookie 名
 * @returns {String|null} 解码后的值，不存在或解码失败返回 null
 */
function readCookie(cookieHeader, name) {
    if (typeof cookieHeader !== 'string' || !cookieHeader) return null;
    for (const part of cookieHeader.split(';')) {
        const eq = part.indexOf('=');
        if (eq < 0) continue;
        if (part.slice(0, eq).trim() !== name) continue;
        try {
            return decodeURIComponent(part.slice(eq + 1).trim());
        } catch (e) {
            return null;  // 非法百分号编码
        }
    }
    return null;
}

/**
 * 按 IANA 时区名取该时区下的墙钟时间
 * @param {String} tzName 如 'Asia/Shanghai'
 * @param {Date} instant 参照时刻
 * @returns {Date|null} 时区名非法或服务器 ICU 不认识时返回 null
 */
function fromTimeZone(tzName, instant) {
    if (!TZ_NAME_RE.test(tzName)) return null;

    let parts;
    try {
        parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tzName,
            hourCycle: 'h23',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).formatToParts(instant);
    } catch (e) {
        return null;
    }

    const v = {};
    for (const p of parts) {
        if (p.type !== 'literal') v[p.type] = Number(p.value);
    }
    if (![v.year, v.month, v.day, v.hour, v.minute, v.second].every(Number.isInteger)) return null;

    return toWallClock(v.year, v.month, v.day, v.hour, v.minute, v.second);
}

/**
 * 按与 UTC 的偏移分钟数取墙钟时间（服务器 ICU 不认识新时区名时的兜底）
 * @param {String} offsetRaw 偏移分钟数字符串，东为正
 * @param {Date} instant 参照时刻
 * @returns {Date|null} 非法或超出范围返回 null
 */
function fromOffset(offsetRaw, instant) {
    if (!OFFSET_RE.test(offsetRaw)) return null;
    const off = Number(offsetRaw);
    if (off < OFFSET_MIN || off > OFFSET_MAX) return null;

    const shifted = new Date(instant.getTime() + off * 60000);
    return toWallClock(
        shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate(),
        shifted.getUTCHours(), shifted.getUTCMinutes(), shifted.getUTCSeconds()
    );
}

/**
 * 把年月日时分秒装进服务器本地时区的 Date，供 lunar-javascript 按字面值读取。
 * 注意：服务器所在时区夏令时前跳的那一小时内墙钟不可表示，该窗口内时辰会偏一位——
 * 每年约一小时，且需访客墙钟恰好落在其中，不额外处理。
 */
function toWallClock(year, month, day, hour, minute, second) {
    const date = new Date(year, month - 1, day, hour, minute, second);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * 解析访客当前的本地时间
 * @param {String} cookieHeader req.headers.cookie
 * @param {Date} [instant] 参照时刻，默认此刻
 * @returns {Date} 访客本地墙钟时间；无 cookie 或 cookie 不可用时退回服务器时间
 */
function resolveUserDate(cookieHeader, instant = new Date()) {
    const raw = readCookie(cookieHeader, COOKIE_NAME);
    if (!raw) return new Date(instant.getTime());

    const [tzName = '', offsetRaw = ''] = raw.split('|');
    return fromTimeZone(tzName.trim(), instant)
        || fromOffset(offsetRaw.trim(), instant)
        || new Date(instant.getTime());
}

module.exports = {
    COOKIE_NAME,
    readCookie,
    resolveUserDate
};
