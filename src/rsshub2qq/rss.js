const {
    rsshub,
    admin,
    email
} = require('../credentials');
const bot = require('../bot');
const db = require('./db');
const db2 = require('./db2');
const rsslist = require('./db/rss.json');
const rp = require('request-promise');
const Parser = require('rss-parser');
const dayjs = require('dayjs');
const _ = require('lodash'); // https://www.lodashjs.com 是一个一致性、模块化、高性能的 JavaScript 实用工具库。
const cheerio = require('cheerio');
const logger = require('../logger');
const faxinxi = require('./faxinxi');
const gongneng = require('./gongneng');
const mkdirTmp = require('./mkdirTmp');
const empty = require('empty-folder');
const node_localStorage = require('node-localstorage').LocalStorage;
const translate = require('./translate');
const schedule = require('node-schedule');
const CQcode = require("./lib/CQcode");

//const fangyitemp = new node_localStorage('./src/rsshub2qq/fangyitemp');
const qiandaosuo = new node_localStorage('../qiandaosuo'); //跨插件签到锁，转推时禁止签到

const fanyi1day = new node_localStorage('./src/rsshub2qq/fanyi1day'); //有道翻译单日统计
const fanyi2day = new node_localStorage('./src/rsshub2qq/fanyi2day'); //百度翻译单日统计

//机器人出错发送警报邮件
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const wellknown = require("nodemailer-wellknown");
const config2 = wellknown("QQ");
config2.secure = true; // 使用 SSL
config2.secureConnection = true; // 使用 SSL
config2.auth = {
    user: email.user,
    pass: email.pass
}
/**
 https://www.cnblogs.com/pingfan1990/p/4864822.html
 node.js发送邮件email
 https://service.mail.qq.com/cgi-bin/help?subtype=1&&id=28&&no=371
 常用邮件客户端软件设置
 https://blog.csdn.net/arvin0/article/details/79582592
 Nodejs使用nodemailer发邮件
 */

//推特主删自己的推会导致转推混乱(修复结果待观察)，同时转推内容没有头像(已修)
//https://rsshub.app/twitter/keyword/%23%E5%90%B8%E8%A1%80%E9%AC%BC%E3%81%95%E3%82%93
//https://rsshub.app/twitter/keyword/%23%E3%81%A8%E3%81%AA%E3%82%8A%E3%81%AE%E5%90%B8%E8%A1%80%E9%AC%BC%E3%81%95%E3%82%93
var timer1 = null;
var timer2 = true;
var errorjishu = 0; //用来记录报错次数，发生两次错误就关闭转推
async function sub(config) {
    //console.log(config.kaiguan);
    //console.log(config.translate);
    //console.log(config.url);
    let actorpic = "";
    let actorlink = "";
    let user = config.user.map(temp => {
        return temp;
    });
    let group = config.group.map(temp => {
        return temp;
    });
    logger.info("1x");
    await new Promise(async function (resolve, reject) {
        rp.get(`${rsshub}${config.url}`, {
            qs: {
                limit: 20
            },
            transform: async function (body, response, resolveWithFullResponse) {
                if (response.headers['content-type'] === 'application/xml; charset=utf-8') {
                    const parser = new Parser();
                    const feed = await parser.parseString(body);
                    let $ = await cheerio.load(body)
                    actorpic = $("url").html();
                    actorpic = actorpic.replace("_normal", "_bigger"); //_400x400,_bigger,_200x200
                    //console.log(actorpic);
                    actorlink = 'https://twitter.com/' + config.url.split('/')[3];
                    logger.info(feed.items[1].link);
                    //logger.info('https://twitter.com/'+config.url.split('/')[3]);
                    return feed;
                } else {
                    return body;
                }
            },
            timeout: 10000,
            encoding: "utf-8"
            //proxy: 'http://127.0.0.1:1082'
        }).then(async feed => {
            //解决启动程序后不会再读取本地文件的问题
            // http://www.blogketori.com/wordpress/2020/03/28/nodejs%E6%9C%AC%E5%9C%B0%E5%AD%98%E5%82%A8%E8%BD%BB%E9%87%8F%E7%BA%A7%E6%95%B0%E6%8D%AE%E5%BA%93lowdb%E4%BD%BF%E7%94%A8/
            //nodejs本地存储轻量级数据库lowdb使用
            let oldFeed = db.read().get(`rss["${config.name}"]`).value();
            /*logger.info("本地推文内容1");
            oldFeed.forEach(oldFeed2 => {
                logger.info(oldFeed2.guid);
            });
            logger.info("本地推文内容2");
            logger.info("请求的推文内容1");
            feed.items.forEach(item => {
                logger.info(item.guid);
            });
            logger.info("请求的推文内容2");*/
            errorjishu = 0; //正常运行即清0
            if (!oldFeed) { // 如果不存在说明是第一次请求
                logger.info('rss：首次请求 ==> ' + config.name);
                db.read().set(`rss["${config.name}"]`, feed.items).write();
                let temp = new Array();
                for (let i = 0; i < feed.items.length; i++) {
                    temp.push({
                        title: feed.items[i].title,
                        description: feed.items[i].content,
                        guid: feed.items[i].guid,
                        time: feed.items[i].pubDate
                    });
                }
                db2.read().set(`rss["${config.name}"]`, temp).write();
                //console.log(feed.items[0].guid);
                resolve(false);
                return false;
            }
            logger.info("2x");

            //对比方式原理不明
            //let items = _.chain(feed2.items).differenceBy(oldFeed, 'guid').filter(function(o) {
            //logger.info(feed[1][0]);
            //Chain可以说是 lodash 中最为重要的部件，想要用lodash进行复杂的多步操作都离不开chain的帮助。
            //console.log(oldFeed.length);
            //config.user.map(temp => console.log(temp));
            let items = _.chain(feed.items).differenceBy(oldFeed, 'guid').filter(function (o) {
                //logger.info("233");
                //let title = o.title;
                /*
                                当这个逻辑运算符长度为 2 的时候（==, !=），只是判断外在的值是不是一样的，而不会判断类型。如
    它输出的结果就是 true。但是如果我们在中间判断的时候再加上一个等号，那么就是严格判断了，需要类型和值都一样的时候才会是 true，否则就是 false。
    ————————————————
    版权声明：本文为CSDN博主「UP-GIS」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。
    原文链接：https://blog.csdn.net/gisredevelopment/article/details/12979479
                                */
                // 过滤转发和回复推文
                //let flag = title.search('Re') !== -1 || title.search('转发了') !== -1;
                //return !flag;
                return o;
            }).value();
            //let b = false;
            let a1 = 0; //,
            //a2 = 0;
            //最多20个，超过20个舍弃第一个记录，全部自动往前移一位。
            let items1 = new Array(); //没发过的推
            let items2 = new Array(); //发过的推
            //let temp2 = db2.get(`rss["${config.name}"]`).value();
            /*logger.info("推文内容1");
            items.forEach(item => {
                logger.info(item.guid);
            });
            logger.info("推文内容2");*/
            //logger.info(temp2.length);
            //对比转推链接记录，得出要转的推是否已经发过
            for (a1 = 0; a1 < items.length; a1++) {
                //logger.info(a1 + 'X.X' + items[a1].guid);
                /* for (a2 = 0; a2 < temp2.length; a2++) {
                     //logger.info(a2 + '.' + temp2[a2].guid);
                     if (items[a1].guid == temp2[a2].guid) {
                         items2.push(items[a1].guid);
                         b = true;
                         break;
                     }
                 }*/
                //if (a2 == temp2.length) {
                items1.push(items[a1]);
                //}
            }
            let translates = new Array(); //数组和字典是一样申明的
            logger.info("3x");

            if (items1.length > 0) {
                logger.info(`rss：发现 ${items1.length} 条更新 ==> ` + config.name);
                let temp1 = db2.get(`rss["${config.name}"]`).value();
                let i = 0;
                let suo = false;
                //logger.info(temp1);
                logger.info("5x");

                let t = await setInterval(async () => {
                    //console.log(i);
                    logger.info("6x");

                    if (suo == false) {
                        suo = true;
                        logger.info("7x");

                        if (i < items1.length) {
                            temp1.push({
                                title: feed.items[i].title,
                                description: feed.items[i].content,
                                guid: feed.items[i].guid,
                                time: feed.items[i].pubDate
                            });
                            //logger.info(temp1);
                            //有道翻译
                            let content = items1[i].content.replace(/<br><video.+?><\/video>|<br><img.+?>/g, e => {
                                return e.replace(/<br>/, '');
                            })
                            let $ = await cheerio.load(content.replace(/<br\/?>/g, '\n'));
                            let text = $.text().trim();
                            let temp2 = items1[i].link.split("/")[5].toString(); //推特链接后面的数字
                            if (action1(user, group, items1) == true) { //翻译是一次性翻完的
                                logger.info("使用翻译api")
                                logger.info(temp2);
                                translates[temp2] = await translate(text, temp2, config.translate1, config.translate2);
                                /*translates[temp2] = await new Promise(function (resolve, reject) {
                                    resolve(translate(text, temp2, config.translate1, config.translate2)); //由于系统设计问题，存在浪费api问题，翻译了不发送
                                });*/
                            } else {
                                logger.info("没有使用api")
                                translates[temp2] = "";
                            }
                            logger.info(i + ",+6666666666");
                            i++;
                            suo = false;
                            logger.info("8x");

                        } else {
                            clearInterval(t);
                            db.read().set(`rss["${config.name}"]`, feed.items).write();
                            db2.read().set(`rss["${config.name}"]`, temp1).write();
                            //私聊
                            //logger.info(translates)
                            logger.info("9x");

                            if (user != null) {
                                let user2
                                logger.info("user1")
                                for (let x = 0; x < user.length; x++) {
                                    user2 = user[x].toString().split(','); //索引0为QQ号。索引1为模式选择：0推主的所有推(所有推主发的推文)，1仅转推主的主题推，2仅转推，3无回复推，4全部推文。内容选择：0仅要含图片的推，1仅要不含图片的推，2仅要链接，3全部。关键词选择指定的推文
                                    let moshi = parseInt(user2[1]); //1
                                    let neirong = parseInt(user2[2]); //1
                                    let guanjianci = user2[3] //允许放行的转推关键词
                                    await new Promise(function (resolve, reject) {
                                        logger.info("user2")
                                        resolve(faxinxi(0, user2, moshi, neirong, actorpic, actorlink, feed, items1, items2, config, send_group, send_private, guanjianci, translates));
                                        logger.info("user3")
                                    });
                                }
                                logger.info("user4")
                            }
                            //群聊
                            if (group != null) {
                                let group2;
                                logger.info("group1")
                                for (let x = 0; x < group.length; x++) {
                                    group2 = group[x].toString().split(',');
                                    let moshi = parseInt(group2[1]); //1
                                    let neirong = parseInt(group2[2]); //1
                                    let guanjianci = group2[3] //允许放行的转推关键词
                                    let longcd = "";
                                    //logger.info("cd"+group2.length);
                                    if (group2.length == 5) {
                                        longcd = group2[4]; //开启长cd转推
                                    }
                                    await new Promise(function (resolve, reject) {
                                        logger.info("group2")
                                        resolve(faxinxi(1, group2, moshi, neirong, actorpic, actorlink, feed, items1, items2, config, send_group, send_private, guanjianci, translates, longcd));
                                        logger.info("group3")
                                    });
                                    logger.info("group:" + x);
                                }
                                logger.info("group4")
                            }
                            logger.info("完成发送任务")
                            resolve(true);
                        }
                    }
                }, 4000);
                //let temp = new Array();
                /*for (i = 0; i < temp1.length; i++) {
                    temp.push({ guid: temp1[i].guid });
                }*/
            }

            /*
            empty('./dist', false, (o)=>{
      if(o.error) console.error(o.error);
      //console.log(o.removed);
      //console.log(o.failed);
    });
    //https://www.npmjs.com/package/empty-folder
            */
            /*else if (b == true) {
                       logger.info('发现推主自删推,更新本地数据');
                       db.set(`rss["${config.name}"]`, feed.items).write();
                   }*/
            else {
                resolve(false);
                return false;
            }
            logger.info("4x");

            //logger.info('rss：开始执行任务,' + t.toString() + dayjs(t.toString()).format(' A 星期d'));错误测试
            //console.log("66666666666666");
            //fangyitemp.clear()
        }).catch((err) => {
            logger.error(new Date().toString() + `:rss：请求RSSHUB失败 ==> ${config.name} ==> ${err.message || JSON.stringify(err)}`);
            if (errorjishu > 6) {
                clearInterval(timer1);
                timer2 = false;
                let i = 0,
                    ii, iii, temp;
                let rsslist_group = new Array(); //从rss文件中得到QQ群号相关信息
                let rsslist_user = new Array(); //从rss文件中得到QQ号相关信息
                let rsslist_group2 = new Array(); //储存QQ群号
                let rsslist_user2 = new Array(); //储存QQ号
                rsslist_group2.push(""); //先把数组长度弄1，否则下面第三重循环开始不运行 
                rsslist_user2.push("");
                Object.keys(rsslist).forEach((i) => {
                    rsslist_group.push(rsslist[i].group.map(rss => {
                        return rss
                    }));
                    rsslist_user.push(rsslist[i].user.map(rss => {
                        return rss
                    }));
                }); //i是字符串，Twitter-XXXXX
                for (i = 0; i < rsslist_group.length; i++) {
                    for (ii = 0; ii < rsslist_group[i].length; ii++) {
                        for (iii = 0; iii < rsslist_group2.length; iii++) {
                            // console.log(xxx[i][ii]);
                            temp = rsslist_group[i][ii].split(",");
                            if (temp[0] == rsslist_group2[iii]) { //如果发现已经有了，就跳出循环
                                break;
                            }
                        }
                        if (iii == rsslist_group2.length) { //只有确认了数组内没有，才会添加
                            rsslist_group2.push(temp[0]);
                        }
                    }
                }
                for (i = 0; i < rsslist_user.length; i++) {
                    for (ii = 0; ii < rsslist_user[i].length; ii++) {
                        for (iii = 0; iii < rsslist_user2.length; iii++) { //如果发现已经有了，就跳出循环
                            //console.log(xxx0[i][ii]);
                            temp = rsslist_user[i][ii].split(",");
                            if (temp[0] == rsslist_user2[iii]) { //只有确认了数组内没有，才会添加
                                break;
                            }
                        }
                        if (iii == rsslist_user2.length) {
                            rsslist_user2.push(temp[0]);
                        }
                    }
                }
                //console.log(rsslist_group2);
                //console.log(rsslist_user2);
                for (i = 1; i < rsslist_user2.length; i++) {
                    temp = rsslist_user2[i];
                    //console.log(temp);
                    if (temp.length > 0) {
                        bot('send_msg', {
                            user_id: temp,
                            message: "转推发生错误，已自动关闭"
                        });
                    }
                }
                for (i = 0; i < rsslist_group2.length; i++) {
                    temp = rsslist_group2[i];
                    logger.error(temp);
                    if (temp.length > 0) {
                        bot('send_msg', {
                            group_id: temp,
                            message: "转推发生错误，已自动关闭"
                        });
                    }
                }
                resolve(false);
            } else {
                errorjishu++;
                resolve(false);
            }
        });
    });
}

module.exports = async function () {
    send_group = (msg, groupx) => {
        return bot('send_group_msg', {
            group_id: groupx,
            message: msg
        });
    }
    send_private = (msg, private2) => {
        return bot('send_private_msg', {
            user_id: private2,
            message: msg
        });
    }

    var startsuo = false;
    async function start() {
        let times1 = 0;
        if (timer2 == false) {
            return;
        }
        if (startsuo == false) {
            try {
                startsuo = true;
                let t = new Date();
                let rsslistindex = 0;
                let rsslistsuo = false;
                let rsslist1 = 0;
                let rsslist2 = new Array();
                let rsslist3 = new Array();
                logger.info("清理图片缓存"); //启动新一轮爬取前，先清理图片缓存
                await new Promise(async function (resolve, reject) {
                    empty('./src/rsshub2qq/tmp', false, (o) => {
                        if (o.error) {
                            logger.error(new Date().toString() + "," + o.error);
                            resolve(false);

                        } else {
                            logger.info(new Date().toString() + "," + "成功清空图片缓存,tmp");
                            resolve(true);
                        }
                        //console.log(o.removed);
                        //console.log(o.failed);
                    });
                });
                Object.keys(rsslist).forEach((c, i) => {
                    rsslist[c].name = c;
                    if (rsslist[c].kaiguan == false) {
                        logger.info(rsslist[c].name + "推特不启动");
                    } //关掉的推特不启动
                    else {
                        rsslist2.push(rsslist[c]);
                        rsslist3.push(rsslist[c].name);
                        rsslistindex++;
                        logger.info("1." + rsslistindex);
                    }
                });
                //logger.info("rsslist2:" + rsslist2);
                logger.info("rsslist3:" + rsslist3);
                logger.info('rss：开始执行任务,' + t.toString() + dayjs(t.toString()).format(' A 星期d').replace("星期0", "星期天"));
                let t2 = setInterval(async () => {
                    if (rsslistsuo == false && timer2 == true) {
                        rsslistsuo = true;
                        if (rsslist1 < rsslistindex) {
                            await new Promise(async (resolve, reject) => {
                                async function getonline2() {
                                    if (await getonline(t) == true) {
                                        resolve(null);
                                    } else {
                                        setTimeout(getonline2, 10000);
                                    }
                                }
                                getonline2();
                            });
                            logger.info('rss：开始抓取：' + rsslist3[rsslist1]);
                            await new Promise(async function (resolve, reject) {
                                resolve(sub(rsslist2[rsslist1]));
                            });
                            logger.info('rss：完成抓取任务：' + rsslist3[rsslist1]);
                            rsslist1++;
                            logger.info("2." + rsslist1);
                            rsslistsuo = false;

                        } else {
                            logger.info("3." + rsslist1);
                            logger.info("4." + rsslistindex);
                            errorjishu = 0; //运行完清0
                            clearTimeout(t2);
                            logger.info('rss：完成抓取任务2：');
                            startsuo = false;
                            rsslistsuo = false;//解决卡死bug
                        }
                    }
                }, 5000);
            }
            catch (err) {
                startsuo = false;
            }
        }

        function getonline(t) {
            return bot('get_status').then(data1 => {
                logger.info(JSON.stringify(data1));
                if (data1.data.online == false || data1.data.online == null || data1.data.app_good == false) {
                    logger.error(times1 + " , " + t.toString() + dayjs(t.toString()).format(' A 星期d').replace("星期0", "星期天") + "gocqhttp在线中：" + data1.data.online + "\n" + "cqhttp插件正常运行中：" + data1.data.app_good);
                    if (times1 > 2) {
                        send_email(t.toString() + dayjs(t.toString()).format(' A 星期d').replace("星期0", "星期天") + "," + JSON.stringify(data1), times1 + " , " + 'robot炸了。。！');
                    }
                    times1++;
                    return false;
                }
                times1 = 0;
                return true;
            }).catch(err => {
                logger.error(times1 + " , " + t.toString() + dayjs(t.toString()).format(' A 星期d').replace("星期0", "星期天") + ",get_status:" + err);
                send_email(t.toString() + dayjs(t.toString()).format(' A 星期d').replace("星期0", "星期天") + ",get_status:" + err, times1 + " , " + 'robot炸了。。！');
                return false;
            });
        }
    }
    start();
    timer1 = setInterval(start, 1000 * 60 * 5);
    await qiandaosuo.setItem("qiandaosuo", "false");
}

function send_email(err, subject, exit = true) {
    let transporter = nodemailer.createTransport(smtpTransport(config2));
    let mailOptions = {
        from: email.from,
        to: email.to,
        subject: subject,
        text: err
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            logger.error("Email ：" + error);
        } else {
            logger.info('Email sent: ' + info.response);
        }
        if (exit == true) {
            process.exit();
        }
    });
    /*
    https://www.qikegu.com/docs/3364
    Node.js 发送Email
    https://jingyan.baidu.com/article/fedf0737af2b4035ac8977ea.html
    如何获取QQ邮箱授权码
    https://www.jianshu.com/p/f2e75080a5e2
    nodemailer
    */
}
mkdirTmp();
Object.keys(rsslist).forEach((c, i) => {
    rsslist[c].name = c;
    //rsslist[c].kaiguan = false;
    gongneng(rsslist[c]);
});
//数字正则表达式 - miyaye - 博客园
//https://www.cnblogs.com/webskill/p/7422876.html
const a1 = /^\d+$/; //验证非负整数（正整数 + 0） 
/*bot.on('message', context => {
    if (context.message_type == 'group') {
        if (context.message == '。动画') {
            return {
                "block": true
            };
        }
    }
});*/


bot.on('message', context => {
    if (context.message_type == 'group') {
        let temp = CQcode.unescape(context.message).replace(/\\\//g, "/");
        if (temp.search('http://103.39.216.176:20218/?group=') != -1 || temp.search('url=http://q1.qlogo.cn/g') != -1) {
            let t = new Date();
            let temp = t.toString() + dayjs(t.toString()).format(' A 星期d').replace("星期0", "星期天") + ", 发现窥屏插件:" + CQcode.unescape(JSON.stringify(context));
            logger.error(temp);
            send_private(temp, admin).then(data => { }).catch(err => {
                logger.error(err);
            });
            send_email(CQcode.unescape(JSON.stringify(context)), "发现窥屏插件", false);
        }
    }
});

function action1(user, group, items1) {
    let temp = false; //默认不翻译
    if (user != null) {
        let user2
        for (let x = 0; x < user.length; x++) {
            user2 = user[x].toString().split(','); //索引0为QQ号。索引1为模式选择：0推主的所有推(所有推主发的推文)，1仅转推主的主题推，2仅转推，3无回复推，4全部推文。内容选择：0仅要含图片的推，1仅要不含图片的推，2仅要链接，3全部。关键词选择指定的推文
            let moshi = parseInt(user2[1]); //1
            let neirong = parseInt(user2[2]); //1
            let guanjianci = user2[3] //允许放行的转推关键词
            if (neirong != 2) {
                temp = action2(moshi, guanjianci, items1); //提前判断是否需要翻译
            }
        }
    }
    //群聊
    if (group != null) {
        let group2;
        for (let x = 0; x < group.length; x++) {
            group2 = group[x].toString().split(',');
            let moshi = parseInt(group2[1]); //1
            let neirong = parseInt(group2[2]); //1
            let guanjianci = group2[3] //允许放行的转推关键词
            if (neirong != 2) {
                temp = action2(moshi, guanjianci, items1);
            }
        }
    }
    return temp;
}

function action2(moshi, guanjianci, items1) {
    let items2 = new Array();
    switch (moshi) {
        default: //全部推
            for (i = 0; i < items1.length; i++) {
                items2.push(items1[i]);
            }
            break;
    }
    if (items2.length > 0) {
        return true;
    } else {
        return false;
    }
}

//var rule = new schedule.RecurrenceRule();
//rule.dayOfWeek = [0, new schedule.Range(1, 6)];
//rule.hour = 21;
//rule.minute = 0;
/*
        每分钟的第30秒触发： '30 * * * * *'

每小时的1分30秒触发 ：'30 1 * * * *'

每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'

每月的1日1点1分30秒触发 ：'30 1 1 1 * *'

2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'

每周1的1点1分30秒触发 ：'30 1 1 * * 1'
https://www.jianshu.com/p/8d303ff8fdeb
        */
/*async function test() {
    let tempday1 = await fanyi1day.getItem("success"); //有道翻译
    if (tempday1 == null) {
        tempday1 = 0;
    }
    await fanyi1day.setItem("success", tempday1);
    let temp2day1 = await fanyi1day.getItem("zishu");
    if (temp2day1 == null) {
        temp2day1 = 0;
    }
    await fanyi1day.setItem("zishu", temp2day1);
    let failtemp1 = await fanyi1day.getItem("fail");
    if (failtemp1 == null) {
        failtemp1 = 0;
    }
    await fanyi1day.setItem("fail", failtemp1);
    let bigfailtemp1 = await fanyi1day.getItem("bigfail");
    if (bigfailtemp1 == null) {
        bigfailtemp1 = 0;
    }
    await fanyi1day.setItem("bigfail", bigfailtemp1);

    let tempday2 = await fanyi2day.getItem("success"); //百度翻译
    if (tempday2 == null) {
        tempday2 = 0;
    }
    await fanyi2day.setItem("success", tempday2);
    let temp2day2 = await fanyi2day.getItem("zishu");
    if (temp2day2 == null) {
        temp2day2 = 0;
    }
    await fanyi2day.setItem("zishu", temp2day2);
    let bigfailtemp2 = await fanyi2day.getItem("bigfail");
    if (bigfailtemp2 == null) {
        bigfailtemp2 = 0;
    }
    await fanyi2day.setItem("bigfail", bigfailtemp2);

    send_private(`今日有道翻译：\n使用次数：${tempday1}\n使用字数：${temp2day1}\n失败次数：${failtemp1}\n大失败次数：${bigfailtemp1}\n今日百度翻译：\n使用次数：${tempday2}\n使用字数：${temp2day2}\n大失败次数：${bigfailtemp2}`, admin).then(data => {}).catch(err => {
        logger.error(err);
    });

    let t = new Date();
    logger.info('翻译字数统计：' + `今日有道翻译：\n使用次数：${tempday1}\n使用字数：${temp2day1}\n失败次数：${failtemp1}\n大失败次数：${bigfailtemp1}\n今日百度翻译：\n使用次数：${tempday2}\n使用字数：${temp2day2}\n大失败次数：${bigfailtemp2}` + t.toString() + dayjs(t.toString()).format(' A 星期d').replace("星期0", "星期天"));
}
test();*/
var j = schedule.scheduleJob('0 0 0 * * *' /*rule*/, async function () {
    let tempday1 = await fanyi1day.getItem("success"); //有道翻译
    await fanyi1day.setItem("success", 0);
    let temp2day1 = await fanyi1day.getItem("zishu");
    await fanyi1day.setItem("zishu", 0);
    let failtemp1 = await fanyi1day.getItem("fail");
    await fanyi1day.setItem("fail", 0);
    let bigfailtemp1 = await fanyi1day.getItem("bigfail");
    await fanyi1day.setItem("bigfail", 0);

    let tempday2 = await fanyi2day.getItem("success"); //百度翻译
    await fanyi2day.setItem("success", 0);
    let temp2day2 = await fanyi2day.getItem("zishu");
    await fanyi2day.setItem("zishu", 0);
    let bigfailtemp2 = await fanyi2day.getItem("bigfail");
    await fanyi2day.setItem("bigfail", 0);

    send_private(`今日有道翻译：\n使用次数：${tempday1}\n使用字数：${temp2day1}\n失败次数：${failtemp1}\n大失败次数：${bigfailtemp1}\n今日百度翻译：\n使用次数：${tempday2}\n使用字数：${temp2day2}\n大失败次数：${bigfailtemp2}`, admin).then(data => { }).catch(err => {
        logger.error(err);
    });

    let t = new Date();
    logger.info('翻译字数统计：' + `今日有道翻译：\n使用次数：${tempday1}\n使用字数：${temp2day1}\n失败次数：${failtemp1}\n大失败次数：${bigfailtemp1}\n今日百度翻译：\n使用次数：${tempday2}\n使用字数：${temp2day2}\n大失败次数：${bigfailtemp2}` + t.toString() + dayjs(t.toString()).format(' A 星期d').replace("星期0", "星期天"));
});


/*bot.on('message', context => {
    if (context.message_type == 'group') {
        if (context.user_id == admin) {
            if (context.message == "随机") {
                bot('send_group_msg', { //send_group_msg
                    group_id: context.group_id,
                    message: '随机数:' + parseInt(Math.random() * 20)
                }).then(data => {
                    logger.info(JSON.stringify(data));
                }).catch(err => {
                    logger.error(JSON.stringify(err));
                });
            } else if (context.message == "随机2") {
                bot('send_group_msg', { //send_group_msg
                    group_id: context.group_id,
                    message: '随机数2:' + parseInt(20 + Math.random() * 5)
                }).then(data => {
                    logger.info(JSON.stringify(data));
                }).catch(err => {
                    logger.error(JSON.stringify(err));
                });
            }
        }
    }
});*/