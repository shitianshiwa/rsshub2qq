# 不知道能不能用，未做测试

# 该项目依赖这个运行环境
* https://github.com/shitianshiwa/docker-wine-go-cqhttp

# rsshub2qq

> 基于go-cqhttp制作的 RSSHub QQ群推送机器人，用于订阅RSSHub的更新并转发到QQ群

## 使用

下载[go-cqhttp](https://github.com/Mrs4s/go-cqhttp/releases)



申请一个 [有道翻译的 API](http://ai.youdao.com/?keyfrom=fanyi-new-nav)
申请一个 [百度翻译的 API](http://api.fanyi.baidu.com/)

可选:
下载[RSSHub](https://github.com/DIYgod/RSSHub)
申请一个推特key来配置RSSHUB[申请推特开发者key地址](https://developer.twitter.com/apps)

### credentials.js 相关配置

修改 /src/credentials.js 文件

```javascript
module.exports = {
    admin: -1,
    accessToken: '',//这个看go-cqhttp那边，那边为空这里为空。 "http://127.0.0.1:8989": "" 后面这个""就是accessToken
    proxy: false,//是否使用代理下载图片
    apiRoot: 'http://127.0.0.1:5700/',
    host: '127.0.0.1',
    port: 8989,
    proxyip: 'http://127.0.0.1:1080',
    rsshub: 'http://rsshub.app',
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
        from: '', // 你的QQ邮箱网址，必须与上面配置一致(user)
        to: '',
    }
}
```

### go-cqhttp 的相关配置
需要参考这个
https://github.com/Mrs4s/go-cqhttp/blob/master/docs/config.md
修改添加这些
```json
"http_config": 
{
	"enabled": true,
	"host": "127.0.0.1",
	"port": 5700,
	"timeout": 5,
	"post_urls": {
           "http://127.0.0.1:8989": ""
    	}
}
```
### 添加订阅信息

打开 `/src/rsshub2qq/db/rss.json` 文件，添加需要订阅推送的内容

### 运行

```bash
npm install #yarn install 
node index
```

## 其他

- 使用了 RSSHub 来实现订阅功能
- 推荐使用 supervisor 模块，炸了可以自动重启
- 使用有道或者百度翻译
- 可能有一大堆bug，慢慢修复
- 源项目[imiku.me/2018/10/16/1230.html](https://imiku.me/2018/10/16/1230.html)
