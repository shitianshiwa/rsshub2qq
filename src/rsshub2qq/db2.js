const low = require('lowdb');
const path = require('path');
const fs = require('fs');
const dbDir = path.join(__dirname, './db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
const FileSync = require('lowdb/adapters/FileSync');

const adapter2 = new FileSync(path.join(dbDir, 'db2.json'));

const defaults = {
    rss: {}
}

const db2 = low(adapter2);

db2.defaults(defaults).write();

module.exports = db2;