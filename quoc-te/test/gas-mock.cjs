/* Giả lập Apps Script tối thiểu để chạy Intl.gs bằng Node (không ghi vào Sheet / Drive thật). */
'use strict';
const fs = require('fs'), vm = require('vm'), crypto = require('crypto');

function makeEnv(opts) {
  opts = opts || {};
  const mails = [], triggers = [], props = {}, cache = {}, files = {};
  const users = opts.users || {};               // token -> me
  let authCalls = 0;
  function Sheet(name) {
    this.name = name; this.data = [];
  }
  Sheet.prototype = {
    getName() { return this.name; },
    getLastRow() { return this.data.length; },
    getLastColumn() { return this.data.reduce((m, r) => Math.max(m, r.length), 0); },
    setFrozenRows() {},
    appendRow(r) { this.data.push(r.map(v => typeof v === 'string' && v[0] === "'" ? v.slice(1) : v)); },
    getRange(row, col, nr, nc) {
      const sh = this; nr = nr || 1; nc = nc || 1;
      const rng = {
        getValues() { const out = []; for (let i = 0; i < nr; i++) { const r = sh.data[row - 1 + i] || []; const o = []; for (let j = 0; j < nc; j++) o.push(r[col - 1 + j] === undefined ? '' : r[col - 1 + j]); out.push(o); } return out; },
        setValues(v) { for (let i = 0; i < nr; i++) { while (sh.data.length < row + i) sh.data.push([]); const r = sh.data[row - 1 + i]; for (let j = 0; j < nc; j++) r[col - 1 + j] = v[i][j]; } return rng; },
        setValue(v) { return rng.setValues([[v]]); },
        setFontWeight() { return rng; },
        getRow() { return row; }, getLastRow() { return row + nr - 1; }, getColumn() { return col; }, getLastColumn() { return col + nc - 1; },
        getSheet() { return sh; }
      };
      return rng;
    }
  };
  const ss = { sheets: [new Sheet('Sheet1')],
    getSheetByName(n) { return this.sheets.find(s => s.name === n) || null; },
    insertSheet(n) { const s = new Sheet(n); this.sheets.push(s); return s; },
    getSheets() { return this.sheets; },
    deleteSheet(s) { this.sheets = this.sheets.filter(x => x !== s); } };
  function fmt(d, tz, f) {
    const p = n => String(n).padStart(2, '0');
    return f.replace('yyyy', d.getFullYear()).replace('yy', String(d.getFullYear()).slice(2)).replace('MM', p(d.getMonth() + 1)).replace('dd', p(d.getDate()))
      .replace('HH', p(d.getHours())).replace('mm', p(d.getMinutes())).replace('ss', p(d.getSeconds()));
  }
  const ctx = {
    console,
    SpreadsheetApp: { getActive: () => ss, flush() {} },
    ContentService: { MimeType: { JSON: 'json', JAVASCRIPT: 'js' }, createTextOutput(t) { return { text: t, mime: 'text', setMimeType(m) { this.mime = m; return this; } }; } },
    Utilities: {
      formatDate: fmt,
      base64Decode: s => Array.from(Buffer.from(s, 'base64')),
      base64EncodeWebSafe: b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
      computeDigest: (a, s) => Array.from(crypto.createHash('sha256').update(s).digest()),
      DigestAlgorithm: { SHA_256: 'sha256' },
      newBlob: (bytes, mime, name) => ({ bytes, mime, name })
    },
    CacheService: { getScriptCache: () => ({ get: k => cache[k] || null, put: (k, v) => { cache[k] = v; } }) },
    UrlFetchApp: { fetch(url, o) {
      authCalls++;
      const b = JSON.parse(o.payload);
      const me = b.action === 'authMe' ? users[b.token] : null;
      const body = me ? { ok: true, me } : { ok: false, expired: true, error: 'Phiên đăng nhập đã hết hạn' };
      return { getContentText: () => JSON.stringify(body) };
    } },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] || null, setProperty: (k, v) => { props[k] = v; } }) },
    DriveApp: {
      Access: { ANYONE_WITH_LINK: 'link' }, Permission: { VIEW: 'view' },
      _folder: null,
      getFolderById(id) { if (this._folder && this._folder.id === id) return this._folder; throw new Error('no folder'); },
      getFoldersByName() { const f = this._folder; return { hasNext: () => !!f, next: () => f }; },
      createFolder(n) {
        this._folder = { id: 'FOLDER1', name: n, getId() { return this.id; },
          createFile(blob) { const id = 'FILE' + (Object.keys(files).length + 1) + 'abcdefghij'; files[id] = blob;
            return { getId: () => id, getUrl: () => 'https://drive.google.com/file/d/' + id + '/view', setSharing() { blob.shared = true; } }; } };
        return this._folder;
      }
    },
    MailApp: { sendEmail(m) { mails.push(m); } },
    ScriptApp: { getProjectTriggers: () => triggers, newTrigger: h => ({ forSpreadsheet: () => ({ onEdit: () => ({ create() { triggers.push({ getHandlerFunction: () => h }); } }) }) }) }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(opts.file, 'utf8'), ctx, { filename: 'Intl.gs' });
  function post(body) { return JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).text); }
  function get(params) { return ctx.doGet({ parameter: params }); }
  return { ctx, ss, mails, files, triggers, post, get, authCalls: () => authCalls, sheet: n => ss.getSheetByName(n) };
}
module.exports = { makeEnv };
