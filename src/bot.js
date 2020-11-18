const CQHttp = require('cqhttp');
const credentials = require('./credentials');

const bot = new CQHttp({
    apiRoot: credentials.apiRoot,
    accessToken: credentials.accessToken,
});

bot.listen(credentials.port, credentials.host);

module.exports = bot;