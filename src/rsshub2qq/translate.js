const rp = require('request-promise');
const credentials = require('../credentials');
const logger = require('../logger');
const MD5 = require('js-md5');
const sha256 = require('js-sha256');
const dayjs = require('dayjs');
//const utf8 = require('utf8');
/*
https://www.npmjs.com/package/utf8
https://www.it1352.com/1685382.html
utf-8转码
*/
//const crypto = require('crypto');
//const saltKey = '123456';
const appId1 = credentials.youdao.appid;
const appKey1 = credentials.youdao.key;
const appId2 = credentials.baidu.appid;
const appKey2 = credentials.baidu.key;
//const truncate = require('truncate');
//const from = 'auto';
//const to = 'zh-CHS';
const node_localStorage = require('node-localstorage').LocalStorage;
const fanyitemp1 = new node_localStorage('./src/rsshub2qq/fanyi1');
const fanyitemp2 = new node_localStorage('./src/rsshub2qq/fanyi2');
const fanyitemp11 = new node_localStorage('./src/rsshub2qq/fangyitemp1');
const fanyitemp22 = new node_localStorage('./src/rsshub2qq/fangyitemp2');

const fanyi1day = new node_localStorage('./src/rsshub2qq/fanyi1day'); //有道翻译单日统计
const fanyi2day = new node_localStorage('./src/rsshub2qq/fanyi2day'); //百度翻译单日统计
//const http = require('http'),
//querystring = require('querystring');
//const exec = require('child_process').exec;
/*const sha256 = str => {
        let hash = crypto.createHmac('sha256', '123456')
            .update(str, 'utf8')
            .digest('hex'); // a65014c0dfa57751a749866e844b6c42266b9b7d54d5c59f7f7067d973f77817
        // a65014c0dfa57751a749866e844b6c42266b9b7d54d5c59f7f7067d973f77817
        //console.log(hash);
        //console.log(Buffer(hash).toString('base64'))
        return hash;
    }*/
/*版权声明：本文为CSDN博主「AdleyTales」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/adley_app/java/article/details/88825270*/
function truncate(q) {
    var len = q.length;
    if (len <= 20) return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
}
module.exports = async(str, id, youdao = false, baidu = false) => {
        let query = str.replace(/(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/g, '').replace("#", "\n#").replace('\n\n#', '\n#').trim(); //trim可以去掉开头结尾的空格
        let temp4;
        let temp5 = "";
        let temp6 = "";
        let result = "";
        if (query == "") {
            return "";
        } else {
            temp6 = query;
        }
        if (query.search("Re @") != -1) {
            temp6 = "";
            temp4 = query.split(" ");
            for (let i = 2; i < temp4.length; i++) {
                temp6 += temp4[i]; //解决翻译缺失的临时方案
            }
            if (temp6 == "") {
                return "";
            }
            temp5 = temp4[0] + " " + temp4[1] + " ";
            //query = query.replace(/(Re @)[A-Za-z0-9_-]{1,50}/g, '').trim();
        } else if (query.search("Re") != -1) {
            temp6 = "";
            temp4 = query.split(" ");
            for (let i = 1; i < temp4.length; i++) {
                temp6 += temp4[i]; //解决翻译缺失的临时方案
            }
            if (temp6 == "") {
                return "";
            }
            temp5 = temp4[0] + " ";
            //query = query.replace(/^(Re )/g, '').trim();
        }
        logger.info("1." + query)
        logger.info("2." + temp6)
        if (youdao == true) {
            let temp3 = await fanyitemp11.getItem(id);
            if (temp3 != null) {
                logger.info("使用有道翻译缓存")
                result += "\n(缓存)有道翻译:\n" + temp3;
            } else {
                logger.info("使用有道翻译api")
                const salt1 = (new Date).getTime(); //毫秒 https://code-examples.net/zh-CN/q/3606e
                //logger.info(salt1);
                const curTime1 = Math.round(new Date().getTime() / 1000); //https://code-examples.net/zh-CN/q/3606e
                const str1 = appId1 + truncate(temp6) + salt1 + curTime1 + appKey1;
                logger.info(truncate(temp6));
                logger.info(str1);
                const sign1 = sha256(str1);
                logger.info(sign1);
                result += await new Promise((resolve, reject) => {
                    rp.get('https://openapi.youdao.com/api', {
                        qs: {
                            q: temp6,
                            appKey: appId1,
                            salt: salt1,
                            from: 'auto',
                            to: 'zh-CHS',
                            sign: sign1,
                            signType: 'v3',
                            curtime: curTime1
                        },
                        json: true
                    }).then(async data => {
                        if (data.errorCode === '0') {
                            let tempday = await fanyi1day.getItem("success"); //单日使用计数
                            let temp2day = await fanyi1day.getItem("zishu");
                            if (tempday == null) {
                                tempday = 0;
                            }
                            if (temp2day == null) {
                                temp2day = 0;
                            }
                            tempday++;
                            temp2day = parseInt(temp2day) + temp6.length;
                            await fanyi1day.setItem("success", tempday);
                            await fanyi1day.setItem("zishu", temp2day);

                            let temp = await fanyitemp1.getItem("success"); //累计使用计数
                            let temp2 = await fanyitemp1.getItem("zishu");
                            if (temp == null) {
                                temp = 0;
                            }
                            if (temp2 == null) {
                                temp2 = 0;
                            }
                            temp++;
                            temp2 = parseInt(temp2) + temp6.length;
                            await fanyitemp1.setItem("success", temp);
                            await fanyitemp1.setItem("zishu", temp2);
                            await fanyitemp11.setItem(id, temp5 + data.translation.join('\n')); //temp5=回复对象 
                            logger.info("有道翻译的结果：" + data.translation[0]);
                            resolve("\n" + temp5 + data.translation.join('\n') + "\n使用了" + temp + "次有道翻译，累计字数(原文字符,包含换行符)：" + temp2 + "\n");
                        } else {
                            let temp = await fanyitemp1.getItem("fail")
                            if (temp == null) {
                                temp = 0;
                            }
                            temp++;
                            await fanyitemp1.setItem("fail", temp);

                            let temp2 = await fanyi1day.getItem("fail");
                            if (temp2 == null) {
                                temp2 = 0;
                            }
                            temp2++;
                            await fanyi1day.setItem("fail", temp2);

                            let t = new Date();
                            logger.error(temp + ". " + '有道翻译出错:' + t.toString() + dayjs(t.toString()).format(' A 星期d') + JSON.stringify(data));
                            resolve("");
                            //reject(temp + ". " + "有道翻译出错");
                        }
                    }).catch(async e => {
                        let temp = await fanyitemp1.getItem("bigfail"); //累计大错误计数
                        if (temp == null) {
                            temp = 0;
                        }
                        temp++;
                        await fanyitemp1.setItem("bigfail", temp);

                        let temp2 = await fanyi1day.getItem("bigfail"); //单日大错误计数
                        if (temp2 == null) {
                            temp2 = 0;
                        }
                        temp2++;
                        await fanyi1day.setItem("bigfail", temp2);
                        let t = new Date();
                        logger.error(temp + ". " + '有道翻译大出错:' + t.toString() + dayjs(t.toString()).format(' A 星期d') + e);
                        resolve("");
                        //reject(temp + ". " + "有道翻译大出错");
                    })
                });
            }
        }
        if (baidu == true) {
            //result += "\n";
            let temp3 = await fanyitemp22.getItem(id);
            if (temp3 != null) {
                logger.info("使用百度翻译缓存")
                result += "\n(缓存)百度翻译:\n" + temp3;
            } else {
                logger.info("使用百度翻译api")
                const salt2 = (new Date).getTime();
                logger.info(salt2);
                const str2 = appId2 + temp6 + salt2 + appKey2;
                const sign2 = MD5(str2);
                result += await new Promise((resolve, reject) => {
                    rp.get('https://fanyi-api.baidu.com/api/trans/vip/translate', {
                        qs: {
                            q: temp6,
                            from: 'auto',
                            to: 'zh',
                            appid: appId2,
                            salt: salt2,
                            sign: sign2,
                        },
                        json: true
                    }).then(async data => {
                        //logger.info(JSON.stringify(data.trans_result));
                        let tempday = await fanyi2day.getItem("success");
                        let temp2day = await fanyi2day.getItem("zishu"); //单日使用计数
                        if (tempday == null) {
                            tempday = 0;
                        }
                        if (temp2day == null) {
                            temp2day = 0;
                        }
                        tempday++;
                        temp2day = parseInt(temp2day) + temp6.length;
                        await fanyi2day.setItem("success", tempday);
                        await fanyi2day.setItem("zishu", temp2day);

                        let temp = await fanyitemp2.getItem("success") //累计使用计数
                        let temp2 = await fanyitemp2.getItem("zishu")
                        if (temp == null) {
                            temp = 0;
                        }
                        if (temp2 == null) {
                            temp2 = 0;
                        }
                        temp++;
                        logger.info("字数：" + id + "," + temp6.length);
                        temp2 = parseInt(temp2) + temp6.length;
                        await fanyitemp2.setItem("success", temp);
                        await fanyitemp2.setItem("zishu", temp2);
                        let temp3 = "";
                        let temp4 = data.trans_result;
                        logger.info("百度翻译的结果：" + JSON.stringify(temp4));
                        for (let i = 0; i < temp4.length; i++) {
                            temp3 += temp4[i].dst + (i < temp4.length - 1 ? "\n" : "");
                        }
                        await fanyitemp22.setItem(id, temp5 + temp3); //temp5=回复对象
                        resolve("\n" + temp5 + temp3 + "\n使用了" + temp + "次百度翻译，累计字数(原文字符,包含换行符)：" + temp2);
                        /*if (data.errorCode === '0') {
                            
                        } else {
                            let temp = await fanyitemp2.getItem("fail")
                            temp++;
                            await fanyitemp2.setItem("fail", temp);
                            logger.error(temp + ". " + '百度翻译出错:' + JSON.stringify(data));
                            reject(temp + ". " + "百度翻译出错");
                        }*/
                    }).catch(async e => {
                        let temp = await fanyitemp2.getItem("bigfail") //累计大错误计数
                        if (temp == null) {
                            temp = 0;
                        }
                        temp++;
                        await fanyitemp2.setItem("bigfail", temp);

                        let temp2 = await fanyi2day.getItem("bigfail") //单日大错误计数
                        if (temp2 == null) {
                            temp2 = 0;
                        }
                        temp2++;
                        await fanyi2day.setItem("bigfail", temp2);

                        let t = new Date();
                        logger.error(temp + ". " + '百度翻译大出错:' + t.toString() + dayjs(t.toString()).format(' A 星期d') + e);
                        resolve("");
                        //reject(temp + ". " + "百度翻译大出错");
                    })
                });
            }

        }
        return result;
    }
    //https://www.cnblogs.com/ytu2010dt/p/5486854.html
    //nodejs 回调地狱解决 promise async
    /*module.exports = async(str) => {
        return new Promise((resolve, reject) => {
            var params = {
                'from': 'AUTO',
                'to': 'zh-CHS',
                'i': str,
                'doctype': 'json',
                'version': '2.1',
                'keyfrom': 'fanyi.web',
                'smartresult': 'dict',
                'client': 'fanyideskweb'
            };
            var data = querystring.stringify(params);
            options = {
                host: 'fanyi.youdao.com',
                path: '/translate?smartresult=dict&smartresult=rule',
                method: 'POST',
                headers: {
                    'Referer': 'http://fanyi.youdao.com/',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': data.length,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
                }
            };
            var req = http.request(options, function(res) {
                var result = '';

                res.setEncoding('utf8');
                res.on('data', function(data) {
                    result += data;
                });
                res.on('end', function() {
                    str = result.toString();;
                    var obj = JSON.parse(result),
                        str = obj.translateResult[0][0].tgt;
                    resolve(str);
                });
            });
            req.on('error', function(err) {
                console.log(err);
                reject(err);
            });
            req.write(data);
            req.end();
        });*/
    //return "";
    //var s = "";
    //const salt = (new Date).getTime();
    //const query = str.replace(/(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/g, '');
    //var sss = query;
    //var ss = sss; //String(sss).split("\n");
    //for (var i = 0; i < ss.length; i++) {
    //    s = s + ss[i];
    //}
    //const str1 = appId + query + salt + appKey;
    //const sign = MD5(str1);
    //logger.info("1." + s + "\n");
    //logger.info("2." + String(query).split("\n").length + "\n");
    //console.log("aaaaaa" + str);
    //return ""
    //return str;
    /*let temp = await new Promise(function(resolve, reject) {
        exec('python3 ./src/rsshub2qq/translate.py ' + str, function(error, stdout, stderr) {
            if (stdout.length > 1) {
                resolve(stdout);
                //logger.info('you offer args:', stdout);
                //return stdout;
                //console.log('you offer args:', stdout);
            } else {
                logger.error('you don\'t offer args');
                //console.log();
            }
            if (error) {
                logger.error('stderr : ' + stderr);
                //console.info();
            }
        })

    });
    //console.log(temp);
    return temp;
    */
    /*new Promise((resolve, reject) => {
            rp.get('https://fanyi.baidu.com/translate#en/zh/'+str, {
                qs: {
                    q: query,
                    from: from,
                    to: to,
                    appKey: appId,
                    salt: salt,
                    sign: sign,
                },
                json: true
            }).then(data => {
                if (data.errorCode === '0') {
                    resolve(data.translation[0]);
                } else {
                    reject('翻译出错');
                }
            }).catch(reject)
        })*/