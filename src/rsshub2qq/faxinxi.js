const credentials = require('../credentials');
const proxy = credentials.proxy;
const proxyip = credentials.proxyip;
const fs = require('fs');
const bot = require('../bot');
const path = require('path');
const join = require('path').join;
const cheerio = require('cheerio');
const download = require('download');
//const del = require('del');
const fileType = require('file-type');
const logger = require('../logger');
const node_localStorage = require('node-localstorage').LocalStorage;
const rsstemp = new node_localStorage('./src/rsshub2qq/rsstemp');
const xuanzeneirong = require('./xuanzeneirong');
const videotogif = require('./videotogif');
const qiandaosuo = new node_localStorage('../qiandaosuo'); //跨插件签到锁，转推时禁止签到
const PATH = "./src/rsshub2qq/";
const dayjs = require('dayjs');
const CQcode=require("./lib/CQcode");

//推特主删自己的推会导致转推混乱(无解，只能利用这个特性)，同时转推内容没有头像(已修)
const faxinxi = async(leixing, mubiao, moshi, neirong, actorpic, actorlink, feed, items1, items3, config, send_group, send_private, guanjianci, translates, longcd) => {
    //items3=item2
    let i = 0,
        ii = 0,
        temp;
    let items2 = new Array()
    switch (moshi) {
        case 0: //仅推主的所有推
            temp = guanjianci.split("+"); //无论怎样数组length都为1，”“也是1
            if (temp.length > 1 && temp[0] != "") {
                for (i = 0; i < temp.length; i++) {
                    //logger.info(temp[i]);
                }
                for (i = 0; i < items1.length; i++) {
                    if (items1[i].guid.toString().split('/')[3] == config.url.split('/')[3]) {
                        for (ii = 0; ii < temp.length; ii++) {
                            if (items1[i].contentSnippet.search(temp[ii]) != -1) {
                                items2.push(items1[i]);
                                break;
                            }
                        }
                        //console.log(items1[i]);
                        //console.log(items1[i].title.search('Re'))
                        //console.log(items1[i].title.search('转发了'))
                    }
                }
            } else {
                for (i = 0; i < items1.length; i++) {
                    if (items1[i].guid.toString().split('/')[3] == config.url.split('/')[3]) {
                        items2.push(items1[i]);
                    }
                }
            }
            break;
        case 1: //仅推主的主题推
            temp = guanjianci.split("+");
            if (temp.length > 1 && temp[0] != "") {
                for (i = 0; i < temp.length; i++) {
                    //logger.info(temp[i]);
                }
                for (i = 0; i < items1.length; i++) {
                    if ((items1[i].guid.toString().split('/')[3] == config.url.split('/')[3]) && (items1[i].title.search('Re') == -1 && items1[i].title.search('转发了') == -1)) {
                        for (ii = 0; ii < temp.length; ii++) {
                            if (items1[i].contentSnippet.search(temp[ii]) != -1) {
                                items2.push(items1[i]);
                                break;
                            }
                        }
                        //console.log(items1[i]);
                        //console.log(items1[i].title.search('Re'))
                        //console.log(items1[i].title.search('转发了'))
                    }
                }
            } else {
                for (i = 0; i < items1.length; i++) {
                    if ((items1[i].guid.toString().split('/')[3] == config.url.split('/')[3]) && (items1[i].title.search('Re') == -1 && items1[i].title.search('转发了') == -1)) {
                        //console.log(items1[i]);
                        //console.log(items1[i].title.search('Re'))
                        //console.log(items1[i].title.search('转发了'))
                        items2.push(items1[i]);
                    }
                }
            }
            break;
        case 2: //仅转推，没有推主的推
            for (i = 0; i < items1.length; i++) {
                if (items1[i].guid.toString().split('/')[3] != config.url.split('/')[3]) {
                    items2.push(items1[i]);
                }
            }
            break;
        case 3: //无回复推
            temp = guanjianci.split("+");
            if (temp.length > 1 && temp[0] != "") {
                for (i = 0; i < temp.length; i++) {
                    //logger.info(temp[i]);
                }
                for (i = 0; i < items1.length; i++) {
                    if (items1[i].title.search('Re') == -1 /* && items1[i].title.search('转发了') == -1*/ ) {
                        for (ii = 0; ii < temp.length; ii++) {
                            if (items1[i].contentSnippet.search(temp[ii]) != -1) {
                                items2.push(items1[i]);
                                break;
                            }
                        }
                        //console.log(items1[i]);
                        //console.log(items1[i].title.search('Re'))
                        //console.log(items1[i].title.search('转发了'))
                    }
                }
            } else {
                for (i = 0; i < items1.length; i++) {
                    if (items1[i].title.search('Re') == -1 /* && items1[i].title.search('转发了') == -1*/ ) {
                        items2.push(items1[i]);
                        //console.log(items1[i]);
                        //console.log(items1[i].title.search('Re'))
                        //console.log(items1[i].title.search('转发了'))
                    }
                }
            }
            break;
        default: //全部推
            temp = guanjianci.split("+");
            if (temp.length > 1 && temp[0] != "") {
                for (i = 0; i < temp.length; i++) {
                    //logger.info(temp[i]);
                }
                for (i = 0; i < items1.length; i++) {
                    for (ii = 0; ii < temp.length; ii++) {
                        if (items1[i].contentSnippet.search(temp[ii]) != -1) {
                            items2.push(items1[i]);
                            break;
                        }
                    }
                }
            } else {
                for (i = 0; i < items1.length; i++) {
                    items2.push(items1[i]);
                }
            }
            break;
    }
    //var messagebackgro = new Array();
    //var messagebackuse = new Array();
    //var userbackup = new Array();
    //var groupbackup = new Array();
    //let jishu = 0;
    //let jishus = items2.length;
    let index = 0;
    let index2 = items2.length;
    let jilu = new Array();
    i = 0;
    ii = 0;
    let suo = false;
    await new Promise(function(resolve, reject) {
        let cd = 15;
        let cd0 = 1;
        let cd1 = 0;
        let cd2 = 0;
        if (longcd == "true") {
            qiandaosuo.setItem("qiandaosuo", "true");
        }
        let t1 = setInterval(async() => {
                if (suo == false) {
                    suo = true;
                    if (longcd == "true") {
                        cd2 = cd * 1000;
                        //cd = cd + 15;
                    } else {
                        cd1 = 1 * 1000;
                        //cd0 = cd0 + 1;
                        cd2 = 1 * 1000;
                        //cd = cd + 1;
                    }
                    let item = null;
                    //let translate = "";
                    if (index < items2.length) {
                        jilu.push(items2[index].link)
                        if (index == -1) {
                            const imgPath = path.join(__dirname, `./suofei.jpg`);
                            logger.info(imgPath);
                            let message = `[CQ:image,file=file:///${imgPath}]\n索菲·特瓦伊莱特`;
                            send_group(message, mubiao[0]).then(data => {
                                logger.info('rss：群消息发送成功:' + JSON.stringify(data));
                            }).catch(err => {
                                logger.error(new Date().toString() + `:rss：群消息发送失败xxx${err.message || JSON.stringify(err)}`);
                            });
                            index++;
                            suo = false;
                            return true;
                        }
                        item = items2[index];
                        /*if (translates.length == items2.length) {
                            translate = translates;
                        }*/
                        //logger.info(translates[index]);
                        index++;
                        logger.info("移除图片前后的换行，以免出现发送文字时格式问题");
                        // 移除图片前后的换行，以免出现发送文字时格式问题
                        let content = item.content.replace(/<br><video.+?><\/video>|<br><img.+?>/g, e => {
                            return e.replace(/<br>/, '');
                        })
                        let $ = await cheerio.load(content.replace(/<br\/?>/g, '\n'));
                        let videoLength = $('video').length;
                        let text = $.text().trim();
                        let imgs = new Array();
                        let video = false;
                        let videos = new Array();
                        let videos2 = null;
                        let videos3 = 0;
                        let music = null;
                        let video5 = null;
                        let src = null;
                        let src2 = null;
                        let images = null;
                        let images2 = new Array();
                        // 获取媒体资源
                        try {
                            if (actorpic != "") {
                                imgs.push(actorpic); //推特主头像
                                //console.log(actorpic);
                            }
                            if ($('img').length || $('video').length) {
                                $('img').each(function() {
                                    src = $(this).attr('src');
                                    if (src) imgs.push(src);
                                })
                                $('video').each(function() { //视频mp4
                                    src = $(this).attr('poster');
                                    if (src) {
                                        imgs.push(src);
                                    }
                                    src2 = $(this).attr('src')
                                    if (src2) {
                                        videos.push(src2);
                                        logger.info(src2);
                                    }
                                });
                                if (src2 != null) { //有视频
                                    if (src2.search('tweet_video') != -1) {
                                        videos3 = 1;
                                        //GIF
                                    } else if (src2.search('ext_tw_video') != -1) {
                                        videos3 = 2;
                                        video = true;
                                        //视频
                                    } else if (src2.search('amplify_video') != -1) {
                                        videos3 = 2;
                                        video = true;
                                        //视频
                                    }
                                    videos2 = await downloadvideo(videos);
                                    logger.info("视频mp4：" + videos2);
                                }
                            }
                            images = await downloadpic(imgs);
                        } catch (error) {
                            logger.error(new Date().toString() + `,图片下载失败 ==> ${config.name} ==> ${error.message || JSON.stringify(error)},` + item.link);
                        }
                        //console.log(images);
                        if (images == null) { //没有图片
                            images = new Array();
                        }
                        if (videos2 == null) { //没有视频
                            videos2 = new Array();
                        }
                        for (let x = 1; x < images.length; x++) {
                            images2.push(images[x]);
                            //logger.info(images[x]);
                        }
                        logger.info("videos2:" + videos2.length);
                        logger.info("images20:" + images2);
                        let video4 = null;
                        let fileDataArr2;
                        for (let i = 0; i < videos2.length; i++) {
                            logger.info("videos21:" + videos2[i]);
                            logger.info("videos22:" + videos2[i].replace("mp4", "gif"));
                            fileDataArr2 = await new Promise(async function(resolve0, reject0) {
                                let fileNames;
                                logger.info("解决重复制造gif的问题:");
                                resolve0(await new Promise(function(resolve1, reject1) {
                                    fileNames = findSync('./src/rsshub2qq/tmp');
                                    if (fileNames.length > 0) {
                                        let ii = 0;
                                        for (ii = 0; ii < fileNames.length; ii++) {
                                            if ((videos2[i].split("/tmp/")[1].split(".")[0] == fileNames[ii].split("/tmp/")[1].split(".")[0]) && (fileNames[ii].split("/tmp/")[1].search('gif') != -1)) { //确认是否已制造出gif图
                                                break;
                                            }
                                        }
                                        if (ii < fileNames.length) {
                                            resolve1(true);
                                        } else {
                                            resolve1(false);
                                        }
                                    } else {
                                        resolve1(false);
                                    }
                                }));
                            });
                            //没判断从视频文件中分离的声音文件
                            if (fileDataArr2 == false) {
                                video5 = `[CQ:video,file=file:///${videos2[i]}]`; //linux
                                video4 = await videotogif(videos2[i], videos2[i].replace("mp4", "gif"), PATH, video, -1, '255');
                                if (video4 == true || video4 == "no music") {
                                    logger.info("videos23:" + videos2[i].replace("mp4", "gif"));
                                    images2.push(videos2[i].replace("mp4", "gif"));
                                    if (video == true && video4 != "no music") {
                                        //music = `[CQ:record,file=file:///${videos2[i].replace(/\//g, "\\").replace("mp4", "amr")}]`;//windows
                                        music = `[CQ:record,file=file:///${videos2[i].replace("mp4", "amr")}]`; //linux
                                    }
                                }
                            } else {
                                video5 = `[CQ:video,file=file:///${videos2[i]}]`; //linux
                                images2.push(videos2[i].replace("mp4", "gif"));
                                if (video == true) {
                                    let fileDataArr3 = await new Promise(async function(resolve2, reject2) {
                                        let fileNames;
                                        logger.info("解决没有音频文件的问题:");
                                        resolve2(await new Promise(function(resolve3, reject3) {
                                            fileNames = findSync('./src/rsshub2qq/tmp');
                                            if (fileNames.length > 0) {
                                                let ii = 0;
                                                for (ii = 0; ii < fileNames.length; ii++) {
                                                    if ((videos2[i].split("/tmp/")[1].split(".")[0] == fileNames[ii].split("/tmp/")[1].split(".")[0]) && (fileNames[ii].split("/tmp/")[1].search('amr') != -1)) { //确认是否已分离出mp3
                                                        break;
                                                    }
                                                }
                                                if (ii < fileNames.length) {
                                                    resolve3(true);
                                                } else {
                                                    resolve3(false);
                                                }
                                            } else {
                                                resolve3(false);
                                            }
                                        }));
                                    });
                                    if (fileDataArr3 == true) {
                                        //music = `[CQ:record,file=file:///${videos2[i].replace(/\//g, "\\").replace("mp4", "amr")}]`;//windows
                                        music = `[CQ:record,file=file:///${videos2[i].replace("mp4", "amr")}]`; //linux

                                    }
                                }
                            }
                        }
                        logger.info("images24:" + images2);
                        let pic = await Promise.all(images2.map(async imgPath => {
                            //logger.info(imgPath);
                            let size = await new Promise(function(resolve4, reject4) {
                                fs.stat(imgPath, function(error, stats) {
                                    if (error) {
                                        logger.error("file size error");
                                        resolve4(-1);
                                        //reject(error);
                                    } else {
                                        //文件大小
                                        //logger.info(stats.size);
                                        resolve4(stats.size);
                                    }
                                })
                            });
                            if (size == -1) {
                                return `图片解析错误，无法发送(图片体积:${(size/1024/1024).toFixed(4)}MB)`; //图片太大会发不出去，图片最大30MB以内
                            }
                            /*
                            上限应该就是30MB了
                            png格式不会被压图，jpg会二压
                            gif非动图转成png，gif动图原样发送(总帧数最大300张，超过无法发出，无论循不循环)

上传图片期间，机器人无法上报事件给插件（http 多点上报，应该是连接方式问题？）
https://blog.csdn.net/hxy199421/article/details/88041305
nodejs保留小数位

huangxy1994 2019-02-28 18:56:54   3311   收藏
分类专栏： nodejs
版权
代码：

var i = 12.345
console.log(i.toFixed(2))


输出结果：

12.35
                            */
                            if (size / 1024 / 1024 <= 30) {
                                return `[CQ:image,file=file:///${imgPath}]图片体积:${(size/1024/1024).toFixed(4)}MB`; //图片太大会发不出去，图片最大30MB以内
                            } else {
                                logger.info(size + "字节/B");
                                if (imgPath.split('/tmp/')[1].search("gif") == -1 && await downloadpic2(imgPath.split('/tmp/')[1]) == true) {
                                    let size2 = await new Promise(function(resolve5, reject5) {
                                        fs.stat(imgPath, function(error, stats) {
                                            if (error) {
                                                logger.error("file size error");
                                                resolve5(-1);
                                                //reject(error);
                                            } else {
                                                //文件大小
                                                //logger.info(stats.size);
                                                resolve5(stats.size);
                                            }
                                        })
                                    });
                                    if (size2 == -1) {
                                        return `图片解析错误，无法发送(图片体积:${(size2/1024/1024).toFixed(4)}MB)`; //图片太大会发不出去，图片最大30MB以内
                                    } else {
                                        return `[CQ:image,file=file:///${imgPath}]原图片体积:${(size/1024/1024).toFixed(4)}MB,压缩后:${(size2/1024/1024).toFixed(4)}MB(原图片大于30MB，go-cqhttp无法发送)`; //图片太大会发不出去，图片最大30MB以内
                                    }
                                } else {
                                    return `图片大于30MB，无法发送(图片体积:${(size/1024/1024).toFixed(4)}MB)`; //图片太大会发不出去，图片最大30MB以内
                                }
                                //logger.info(imgPath);
                            }
                        }));
                        logger.info("images25");
                        let cqimgpaths = new Array();
                        pic.forEach(pic => {
                            cqimgpaths.push(pic);
                        });
                        let cqimgpath = cqimgpaths.map(imgPath => {
                            return imgPath;
                        });
                        //logger.info(cqimgpath);
                        let cheadpath = `[CQ:image,file=file:///${images[0]}]`;
                        //logger.info(images[0]);
                        i = i + 1;
                        //console.log('x'+text);
                        text = text.replace(/http/g, " http") //给链接加分割 
                        let message = xuanzeneirong(neirong, i, cheadpath, feed, actorlink, config, text, videoLength, videos3, videos, music, cqimgpath, item, items1, translates, items2);
                        message=CQcode.unescape(message);
                        if (message == "") {
                            logger.info(item.link + "因为条件限制未发送");
                            //jishu++;
                            index2--;
                            suo = false;
                            return false;
                        }
                        logger.info("images26");
                        logger.info("mubiao:" + rsstemp.getItem(mubiao[0]));
                        //先图片后文字(假的)
                        switch (leixing) {
                            case 0:
                                if (rsstemp.getItem(mubiao[0]) == '1' || rsstemp.getItem(mubiao[0]) == null) {
                                    await new Promise(function(resolve6, reject6) {
                                        let t = setTimeout(() => {
                                            clearTimeout(t);
                                            send_private(message, mubiao[0]).then(data => {
                                                logger.info('rss：私聊消息发送成功 ==> ' + item.link + ' , ' + JSON.stringify(data));
                                                if (music != null && neirong != 2) {
                                                    send_private(music, mubiao[0]).then(data => {
                                                        logger.info('rss：私聊消息发送语音成功 ==> ' + item.link + ' , ' + JSON.stringify(data));
                                                        index2--;
                                                        suo = false;
                                                        resolve6(null);
                                                        t = null;
                                                    }).catch(err => {
                                                        let t1 = new Date();
                                                        logger.error(new Date().toString() + `:rss：私聊消息语音发送失败 ==> ${item.link} ==> ${err.message || JSON.stringify(err)||err}`);
                                                        let temp = rsstemp.getItem('twittererrors');
                                                        if (temp == "") {
                                                            rsstemp.setItem('twittererrors', t1.toString() + dayjs(t1.toString()).format(' A 星期d').replace("星期0", "星期天") + mubiao[0] + ':' + message);
                                                        } else {
                                                            temp += ("\n" + t1.toString() + dayjs(t1.toString()).format(' A 星期d').replace("星期0", "星期天") + mubiao[0] + ':' + message);
                                                            rsstemp.setItem('twittererrors', temp);
                                                        }
                                                        let t2 = setTimeout(() => {
                                                            clearTimeout(t2);
                                                            bot('send_msg', {
                                                                user_id: mubiao[0],
                                                                message: "私聊转推发送语音错误,推特链接:" + item.link
                                                            });
                                                            index2--;
                                                            suo = false;
                                                            resolve6(null);
                                                            t = null;
                                                            t2 = null;
                                                            //jishu++;
                                                        }, cd1);
                                                    });
                                                } else {
                                                    index2--;
                                                    suo = false;
                                                    resolve6(null);
                                                    t = null;
                                                }
                                            }).catch(err => {
                                                logger.error(new Date().toString() + `:rss：私聊消息发送失败1 ==> ${item.link} ==> ${err.message || JSON.stringify(err)||err}`);
                                                let t = setTimeout(() => {
                                                    clearTimeout(t);
                                                    send_private(message, mubiao[0]).then(data => {
                                                        logger.info('rss：私聊消息发送成功 ==> ' + item.link + ' , ' + JSON.stringify(data));
                                                        index2--;
                                                        suo = false;
                                                        resolve6(null);
                                                        t = null;
                                                    }).catch(err => {
                                                        let t1 = new Date();
                                                        logger.error(new Date().toString() + `:rss：私聊消息发送失败2 ==> ${item.link} ==> ${err.message || JSON.stringify(err)||err}`);
                                                        let temp = rsstemp.getItem('twittererrors');
                                                        if (temp == "") {
                                                            rsstemp.setItem('twittererrors', t1.toString() + dayjs(t1.toString()).format(' A 星期d').replace("星期0", "星期天") + mubiao[0] + ':' + message);
                                                        } else {
                                                            temp += ("\n" + t1.toString() + dayjs(t1.toString()).format(' A 星期d').replace("星期0", "星期天") + mubiao[0] + ':' + message);
                                                            rsstemp.setItem('twittererrors', temp);
                                                        }
                                                        let t2 = setTimeout(() => {
                                                            clearTimeout(t2);
                                                            bot('send_msg', {
                                                                user_id: mubiao[0],
                                                                message: "私聊转推发送错误,推特链接:" + item.link
                                                            });
                                                            index2--;
                                                            suo = false;
                                                            resolve6(null);
                                                            t = null;
                                                            t2 = null;
                                                            //jishu++;
                                                        }, cd1);
                                                    });
                                                    //jishu++;
                                                }, cd1);
                                            });
                                            //jishu++;
                                        }, cd1);
                                    });
                                } else {
                                    index2--;
                                    suo = false;
                                }
                                break;
                            case 1:
                                if (rsstemp.getItem(mubiao[0]) == '1' || rsstemp.getItem(mubiao[0]) == null) {
                                    await new Promise(function(resolve7, reject7) {
                                        let t = setTimeout(() => {
                                            clearTimeout(t);
                                            send_group(message, mubiao[0]).then(data => {
                                                logger.info('rss：群消息发送成功 ==> ' + item.link + ' , ' + JSON.stringify(data));
                                                if (music != null && neirong != 2) {
                                                    send_group(music, mubiao[0]).then(data => {
                                                        logger.info('rss：群消息发送语音成功 ==> ' + item.link + ' , ' + JSON.stringify(data));
                                                        index2--;
                                                        suo = false;
                                                        resolve7(null);
                                                        t = null;
                                                    }).catch(err => {
                                                        let t1 = new Date();
                                                        logger.error(new Date().toString() + `:rss：群消息语音发送失败 ==> ${item.link} ==> ${err.message || JSON.stringify(err)||err}`);
                                                        let t = setTimeout(() => {
                                                            clearTimeout(t);
                                                            let temp = rsstemp.getItem('twittererrorg');
                                                            if (temp == "") {
                                                                rsstemp.setItem('twittererrorg', t1.toString() + dayjs(t1.toString()).format(' A 星期d').replace("星期0", "星期天") + " " + mubiao[0] + ':' + message);
                                                            } else {
                                                                temp += ("\n" + t1.toString() + dayjs(t1.toString()).format(' A 星期d').replace("星期0", "星期天") + " " + mubiao[0] + ':' + message);
                                                                rsstemp.setItem('twittererrorg', temp);
                                                            }
                                                            let t2 = setTimeout(() => {
                                                                clearTimeout(t2);
                                                                bot('send_msg', {
                                                                    group_id: mubiao[0],
                                                                    message: "群转推发送错误,推特链接:" + item.link
                                                                }).catch(err => {});
                                                                index2--;
                                                                suo = false;
                                                                resolve7(null);
                                                                t = null;
                                                                t2 = null;
                                                                //jishu++;
                                                            }, cd2);
                                                        }, cd2);
                                                    });
                                                } else {
                                                    index2--;
                                                    suo = false;
                                                    resolve7(null);
                                                    t = null;
                                                }
                                                /*if (video == true) {
                                                    send_group(video5, mubiao[0]).then(data => {
                                                        logger.info('rss：群消息发送短视频成功 ==> ' + item.link + ' , ' + JSON.stringify(data));
                                                        
                                                    }).catch(err => {
                                                        logger.error(new Date().toString() + `:rss：群消息短视频发送失败 ==> ${item.link} ==> ${err.message || JSON.stringify(err)||err}`);
                                                    });
                                                } else {
                                                    index2--;
                                                    suo = false;
                                                    resolve7(null);
                                                    t = null;
                                                }*/
                                            }).catch(err => {
                                                logger.error(new Date().toString() + `:rss：群消息发送失败1 ==> ${item.link} ==> ${err.message || JSON.stringify(err)||err}`);
                                                let t = setTimeout(() => {
                                                    clearTimeout(t);
                                                    send_group(message, mubiao[0]).then(data => {
                                                        logger.info('rss：群消息发送成功 ==> ' + item.link + ' , ' + JSON.stringify(data));
                                                        index2--;
                                                        suo = false;
                                                        resolve7(null);
                                                        t = null;
                                                    }).catch(err => {
                                                        let t1 = new Date();
                                                        logger.error(new Date().toString() + `:rss：群消息发送失败2 ==> ${item.link} ==> ${err.message || JSON.stringify(err)||err}`);
                                                        let temp = rsstemp.getItem('twittererrorg');
                                                        if (temp == "") {
                                                            rsstemp.setItem('twittererrorg', t1.toString() + dayjs(t1.toString()).format(' A 星期d').replace("星期0", "星期天") + " " + mubiao[0] + ':' + message);
                                                        } else {
                                                            temp += ("\n" + t1.toString() + dayjs(t1.toString()).format(' A 星期d').replace("星期0", "星期天") + mubiao[0] + ':' + " " + message);
                                                            rsstemp.setItem('twittererrorg', temp);
                                                        }
                                                        let t2 = setTimeout(() => {
                                                            clearTimeout(t2);
                                                            bot('send_msg', {
                                                                group_id: mubiao[0],
                                                                message: "群转推发送错误,推特链接:" + item.link
                                                            }).catch(err => {});
                                                            index2--;
                                                            suo = false;
                                                            resolve7(null);
                                                            t = null;
                                                            t2 = null;
                                                            //jishu++;
                                                        }, cd2);
                                                    });
                                                    //jishu++;
                                                }, cd2);
                                            });
                                            //jishu++;
                                        }, cd2);
                                    });
                                    break;
                                } else {
                                    index2--;
                                    suo = false;
                                }
                        }
                        logger.info("images27");
                    } else {
                        logger.info("退出计时器1");
                        if (jilu.length > 0) {
                            let s = "多个转推校验数量回复(用来补缺的)：\n";
                            for (let i = 0; i < jilu.length; i++) {
                                s = s + (i + 1) + " . " + jilu[i] + "\n"
                            }
                            if (rsstemp.getItem(mubiao[0]) == '1' || rsstemp.getItem(mubiao[0]) == null) {
                                switch (leixing) {
                                    case 0:
                                        send_private(s, mubiao[0]).catch(err => {
                                            logger.error(new Date().toString() + JSON.stringify(err));
                                        });
                                        break;
                                    case 1:
                                        send_group(s, mubiao[0]).catch(err => {
                                            logger.error(new Date().toString() + JSON.stringify(err));
                                        });
                                        break;
                                }
                            }
                        }
                        clearInterval(t1);
                        t1 = null;
                    }
                }
            },
            2000);
        let t2 = setInterval(async() => {
            if (index2 <= 0) {
                clearInterval(t2);
                logger.info("退出计时器2");
                await qiandaosuo.setItem("qiandaosuo", "false");
                resolve(true);
                logger.info("长CD发消息结束");
                t2 = null;
            }
        }, 1000);
    });
    //items2.forEach();
    /*let t = setInterval(() => {
        if (jishu == jishus) {
            clearInterval(t);
            logger.info(new Date().toString() + "," + feed.title + "," + leixing + ",end"); //leixing 0为:私聊，1为群聊
            //console.log(images3.length);
            images3.forEach(path => {
                //logger.info(path);
                del(path).catch(logger.error);
            });
        }
    }, 1000);*/
    /**
     * 
     * @param startPath  起始目录文件夹路径
     * @returns {Array}
     */
    //https://www.imooc.com/wenda/detail/459466 nodejs的FS或path如何获取某文件夹下的所有文件的文件名呢。
    function findSync(startPath) {
        let result = [];

        function finder(path) {
            let files = fs.readdirSync(path);
            files.forEach((val, index) => {
                let fPath = join(path, val);
                let stats = fs.statSync(fPath);
                //if(stats.isDirectory()) finder(fPath);
                if (stats.isFile()) {
                    //logger.info(fPath);
                    result.push(fPath);
                }
            });
        }
        finder(startPath);
        return result;
    }
    async function downloadpic(imgs) {
        /*, canshu*/
        logger.info("downloadpic:" + imgs);
        let images = new Array();
        for (let i = 0; i < imgs.length; i++) {
            let temp = imgs[i].split("/media/");
            if (temp.length == 2) {
                temp = imgs[i].split("/media/")[1].split("?")[0]; //图片名等于推特图片名
            } else if (imgs[i].search('tweet_video_thumb') != -1) {
                temp = imgs[i].split("/")[4].split(".")[0]; //GIF
            } else if (imgs[i].search('ext_tw_video_thumb') != -1) {
                temp = imgs[i].split("/pu/img/")[1].split(".")[0] //视频
            } else if (imgs[i].search('amplify_video_thumb') != -1) {
                temp = imgs[i].split("/img/")[1].split(".")[0]; //内嵌式视频 https://twitter.com/inuinu_0/status/1280790861433892864 https://pbs.twimg.com/amplify_video_thumb/1280787787055165445/img/A0_T7KDHAcT7DTLj.jpg
            } else {
                temp = imgs[i].split("/")[5].split(".")[0]; //头像名等于推特头像名
            }
            let fileDataArr = await new Promise(async function(resolve, reject) {
                //imgs[i] = imgs[i].replace("&name=orig", "&name=" + canshu);
                //console.log(imgs.length);
                //console.log(temp);
                /*temp = imgs[i].split("/media/");
                if (temp.length > 1) {
                    temp = path.join(__dirname, `./tmp/${imgs[i].split("/media/")[1].split("?")[0] + ".jpg"}`); //图片名等于推特图片名
                } else {
                    temp = path.join(__dirname, `./tmp/${imgs[i].split("/")[5]}`); //头像名等于推特头像名,图片格式有jpg，png两种
                }
                if (fsExistsSync(temp) == false) { //解决重复下载图片问题*/
                let fileNames;
                let temp2 = await new Promise(function(resolve, reject) {
                    logger.info("downloadpic2:" + temp);
                    fileNames = findSync('./src/rsshub2qq/tmp');
                    if (fileNames.length > 0) {
                        let ii = 0;
                        for (ii = 0; ii < fileNames.length; ii++) {
                            if ((temp == fileNames[ii].split("/tmp/")[1].split(".")[0]) && (fileNames[ii].split("/tmp/")[1].search('jpg') != -1 || fileNames[ii].split("/tmp/")[1].search('png') != -1)) {
                                break;
                            }
                        }
                        if (ii < fileNames.length) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                    logger.info("downloadpic3:" + temp);
                    logger.info("downloadpic4:" + fileNames);
                    //https://www.imooc.com/wenda/detail/459466 nodejs的FS或path如何获取某文件夹下的所有文件的文件名呢。
                    /*(fs.exists(imgs[i], function (exists) {
                        resolve(exists);
                    }));*/
                });
                logger.info("解决重复下载原图片的问题:" + temp2);
                //https://www.jb51.net/article/127906.htm nodejs判断文件、文件夹是否存在及删除的方法
                if (temp2 == false) {
                    resolve(download(imgs[i], {
                        proxy: proxy ? proxyip : false
                    }));
                } else {
                    resolve(fileNames)
                }
                /*} else {
                    images.push(temp);
                    resolve(null); //必须有返回才能跳出去，否则永远卡死在这里
                }*/
            });
            //https://pbs.twimg.com/media/EMkgUZkUYAI-1VQ.jpg:orig|large|medium|small|tiny
            //console.log(fileData);
            //const imgPath = path.join(__dirname, `./tmp/${Math.random().toString(36).substr(2)}.${imgType}`);
            //https://www.haorooms.com/post/js_isArray js判断是否是数组及常见类型判断 
            if (fileDataArr instanceof Array == false) {
                const imgType = fileType(fileDataArr).ext;
                logger.info("下载图片：" + temp);
                const imgPath = path.join(__dirname, `./tmp/${temp}.${imgType}`);
                fs.writeFileSync(imgPath, fileDataArr);
                images.push(imgPath);
            } else {
                let imgPath;
                logger.info("fileDataArr:" + fileDataArr);
                for (let i = 0; i < fileDataArr.length; i++) {
                    if (temp == fileDataArr[i].split("/tmp/")[1].split(".")[0] && fileDataArr[i].search("gif") == -1 && fileDataArr[i].search("mp4") == -1) { //确保只返回jpg和png图片路径
                        imgPath = path.join(__dirname, `./tmp/${fileDataArr[i].split("/tmp/")[1]}`);
                        images.push(imgPath);
                        break;
                    }
                }
                continue;
            }
            //logger.info(imgs); //推特图片链接
            //logger.info(imgPath); //本地路径
            //logger.info(`${imgType}`);//图片类型
            //logger.info(fileDataArr.length);
        }
        return images;
    }
    async function downloadvideo(video) {
        /*, canshu*/
        logger.info("downloadvideo1:" + video);
        let videos = new Array();
        for (let i = 0; i < video.length; i++) {
            let temp = "";
            if (video[i].search('tweet_video') != -1) {
                temp = video[i].split("/tweet_video/")[1].split(".")[0]; //GIF
            } else if (video[i].search('ext_tw_video') != -1) {
                temp = video[i].split("/pu/vid/")[1].split(".mp4")[0].split("/")[1]; //视频
            } else if (video[i].search('amplify_video') != -1) {
                temp = video[i].split("/vid/")[1].split(".mp4")[0].split("/")[1]; //内嵌式视频 https://twitter.com/inuinu_0/status/1280790861433892864 https://video.twimg.com/amplify_video/1280787787055165445/vid/1280x720/Z05_mlEQ_rfIj7rQ.mp4
            } else {
                continue;
            }
            logger.info("downloadvideo2:" + temp);
            let fileDataArr = await new Promise(async function(resolve, reject) {
                let fileNames;
                let temp2 = await new Promise(function(resolve, reject) {
                    fileNames = findSync('./src/rsshub2qq/tmp');
                    if (fileNames.length > 0) {
                        let ii = 0;
                        for (ii = 0; ii < fileNames.length; ii++) {
                            if ((temp == fileNames[ii].split("/tmp/")[1].split(".")[0]) && (fileNames[ii].split("/tmp/")[1].search('mp4') != -1)) {
                                break;
                            }
                        }
                        if (ii < fileNames.length) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                    logger.info("downloadvideo3:" + temp);
                    logger.info("downloadvideo4:" + fileNames);
                    //https://www.imooc.com/wenda/detail/459466 nodejs的FS或path如何获取某文件夹下的所有文件的文件名呢。
                    /*(fs.exists(imgs[i], function (exists) {
                        resolve(exists);
                    }));*/
                });
                logger.info("解决重复下载视频的问题:" + temp2);
                //https://www.jb51.net/article/127906.htm nodejs判断文件、文件夹是否存在及删除的方法
                if (temp2 == false) {
                    resolve(download(video[i], {
                        proxy: proxy ? proxyip : false
                    }));
                } else {
                    resolve(fileNames)
                }
                /*} else {
                    images.push(temp);
                    resolve(null); //必须有返回才能跳出去，否则永远卡死在这里
                }*/
            });
            //https://pbs.twimg.com/media/EMkgUZkUYAI-1VQ.jpg:orig|large|medium|small|tiny //?format=png&name=orig 可能出现这种情况
            //console.log(fileData);
            //const imgPath = path.join(__dirname, `./tmp/${Math.random().toString(36).substr(2)}.${imgType}`);
            //https://www.haorooms.com/post/js_isArray js判断是否是数组及常见类型判断 
            if (fileDataArr instanceof Array == false) {
                const videoType = fileType(fileDataArr).ext;
                logger.info("下载视频：" + temp);
                const videoPath = path.join(__dirname, `./tmp/${temp}.${videoType}`);
                fs.writeFileSync(videoPath, fileDataArr);
                logger.info("videoPath:" + videoPath);
                videos.push(videoPath);
            } else {
                let videoPath;
                for (let i = 0; i < fileDataArr.length; i++) {
                    if (temp == fileDataArr[i].split("/tmp/")[1].split(".")[0] && fileDataArr[i].search("mp4") != -1) { //确保只返回mp4文件路径
                        videoPath = path.join(__dirname, `./tmp/${fileDataArr[i].split("/tmp/")[1]}`);
                        logger.info("downloadvideo5:" + videoPath);
                        videos.push(videoPath);
                        break;
                    }
                }
                continue;
            }
        }
        logger.info("downloadvideo6:" + "完成下载视频");
        return videos;
    }
    async function downloadpic2(imgs) {
        let temp = imgs.split(".")[0]; //头像名等于推特头像名
        let fileDataArr = await new Promise(async function(resolve, reject) {
            imgs = "https://pbs.twimg.com/media/" + temp + "?format=jpg&name=large";
            /*let temp = await new Promise(function (resolve, reject) {
                (fs.exists(imgs, function (exists) {
                    resolve(exists);
                }));
            });*/
            logger.info("解决重复下载大图片的问题(假):");
            //https://www.jb51.net/article/127906.htm nodejs判断文件、文件夹是否存在及删除的方法
            resolve(download(imgs, {
                proxy: proxy ? proxyip : false
            }));
        });
        if (fileDataArr != null) {
            const imgType = fileType(fileDataArr).ext;
            logger.info("压缩图下载：" + temp);
            const imgPath = path.join(__dirname, `./tmp/${temp}.${imgType}`);
            fs.writeFileSync(imgPath, fileDataArr);
            logger.info("完成下载压缩图");
            return true;
        } else {
            return false;
        }
    }
    //检测文件或者文件夹存在 nodeJS
    //node.js - node如何判断文件夹是否存在呢？ - SegmentFault 思否
    //https://segmentfault.com/q/1010000007609219?_ea=1399688
    /*function fsExistsSync(path) {
        try {
            fs.accessSync(path, fs.F_OK);
        } catch (e) {
            return false;
        }
        return true;
    }*/
}
module.exports = faxinxi;