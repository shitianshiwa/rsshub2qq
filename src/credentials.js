module.exports = {
    admin: -1,
    accessToken: '',//这个看go-cqhttp那边
    proxy: false,
    apiRoot: 'http://127.0.0.1:5700/',
    host: '127.0.0.1',
    port: 8989,
    proxyip: 'http://127.0.0.1:1080',
    rsshub: 'http://127.0.0.1:1200',
    // 有道翻译的api授权
    youdao: {
        appid: '',
        key: ''
    },
    // 百度翻译的api授权
    baidu: {
        appid: '',
        key: ''
    },
    email: {
        user: '',
        pass: '', // QQ邮箱此处使用授权码
        from: '', // 你的QQ邮箱网址，必须与上面配置一致
        to: '',
    }
}