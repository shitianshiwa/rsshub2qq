const dayjs = require('dayjs');
const logger = require('../logger');

const xuanzeneirong = (xuanze, i, cheadpath, feed, actorlink, config, text, videoLength, videos3, videos, music, cqimgpath, item, items1, translates, item2) => {
    let message = "";
    let linktemp = item.link.split("/status/")[1];
    ///console.log(linktemp);
    //console.log(Object.keys(translates).length);
    //console.log(translates[linktemp]);
    let fanyi = `翻译链接:\n1. 百度翻译\nhttps://fanyi.baidu.com/\n2.谷歌\nhttps://translate.google.cn`;
    switch (xuanze) {
        case 0: //只要带图片的推
            if (cqimgpath.length > 0) {
                message = `(实际数量：${i}/${item2.length} , 原本总数：${items1.length})\n` + `${cheadpath}【${feed.title}】更新了！\n${actorlink}\n` +
                    (config.title ? `标题：${item.title}\n` : '') +
                    `内容：\n${videoLength ? `${text!=""?text+"\n":""}${videos3==1?videoLength+"个GIF，点击原链接查看":(videos3==2?videoLength+"个视频，点击原链接查看"+(music==null?",备注:该视频无声音\n":"\n声音将转为单独的语音发送\n"):"")}${videos+""}` : text!=""?text+"\n":""}` + `${translates[linktemp]=="" ? `${text!=""?fanyi+"\n":""}` :translates[linktemp]+"\n"}` +
                    `${cqimgpath.length ? `媒体(${cqimgpath.length}张图片)：\n${cqimgpath.length ? `${cqimgpath.join('')}\n` : ''}` : ''}` +
                    /*`发推人：${item.author}\n`*/
                    +
                    `链接：${item.link}\n` +
                    `发推日期：${dayjs(item.pubDate).format('YYYY年M月D日 星期d ').replace("星期0","星期天") + new Date(item.pubDate).toTimeString().split("(")[0]}\n`;
            }
            break;
        case 1: //不带图片的推,会过滤视频和gif推
            if (cqimgpath.length == 0) {
                message = `(实际数量：${i}/${item2.length} , 原本总数：${items1.length})\n` + `${cheadpath}【${feed.title}】更新了！\n${actorlink}\n` +

                    (config.title ? `标题：${item.title}\n` : '') +
                    `内容：\n${videoLength ? `${text!=""?text+"\n":""}${videos3==1?videoLength+"个GIF，点击原链接查看":(videos3==2?videoLength+"个视频，点击原链接查看"+(music==null?",备注:该视频无声音\n":"\n声音将转为单独的语音发送\n"):"")}${videos+""}` : text!=""?text+"\n":""}` + `${translates[linktemp]=="" ? `${text!=""?fanyi+"\n":""}` :translates[linktemp]+"\n"}` +
                    `${cqimgpath.length ? `媒体(${cqimgpath.length}张图片)：\n${cqimgpath.length ? `${cqimgpath.join('')}\n` : ''}` : ''}` +
                    /*`发推人：${item.author}\n`*/
                    +
                    `链接：${item.link}\n` +
                    `发推日期：${dayjs(item.pubDate).format('YYYY年M月D日 星期d ').replace("星期0","星期天") + new Date(item.pubDate).toTimeString().split("(")[0]}\n`;
            }
            break;
        case 2: //仅返回链接：
            message = `(实际数量：${i}/${item2.length} , 原本总数：${items1.length})\n` + `${cheadpath}【${feed.title}】更新了！\n${actorlink}\n` +
                (config.title ? `标题：${item.title}\n` : '') +
                /*`发推人：${item.author}\n`*/
                +`链接：${item.link}\n` + `发推日期：${dayjs(item.pubDate).format('YYYY年M月D日 星期d ').replace("星期0","星期天") + new Date(item.pubDate).toTimeString().split("(")[0]}\n`;
            break;
        default: //全部内容
            message = `(实际数量：${i}/${item2.length} , 原本总数：${items1.length})\n` + `${cheadpath}【${feed.title}】更新了！\n${actorlink}\n` +
                (config.title ? `标题：${item.title}\n` : '') +
                `内容：\n${videoLength ? `${text!=""?text+"\n":""}${videos3==1?videoLength+"个GIF，点击原链接查看":(videos3==2?videoLength+"个视频，点击原链接查看"+(music==null?",备注:该视频无声音\n":"\n声音将转为单独的语音发送\n"):"")}${videos+""}` : text!=""?text+"\n":""}` + `${translates[linktemp]=="" ? `${text!=""?fanyi+"\n":""}` :translates[linktemp]+"\n"}` +
                `${cqimgpath.length ? `媒体(${cqimgpath.length}张图片)：\n${cqimgpath.length ? `${cqimgpath.join('')}\n` : ''}` : ''}` +
                /*`发推人：${item.author}\n`*/
                +
                `链接：${item.link}\n` +
                `发推日期：${dayjs(item.pubDate).format('YYYY年M月D日 星期d ').replace("星期0","星期天") + new Date(item.pubDate).toTimeString().split("(")[0]}\n`;
            break;
    }
    if (config.jilu == true) {

    }
    return message;
}
//dayjs(item.pubDate).format('北京时间(英国格林威治时间+八小时,东八区)YYYY年M月D日HH:mm:ss A  星期d')
//logger.info(`${item.pubDate}`);完整的发推日期  ${dayjs(item.pubDate).format('year年M月D日HH:mm:ss')} ${item.pubDate}
//console.log(dayjs("Wed, 27 Nov 2019 07:20:18 GMT").format('YYYY年M月D日 星期d ') + new Date("Wed, 27 Nov 2019 07:20:18 GMT").toTimeString().split("(")[0]);
//`发推日期：${dayjs(item.pubDate).format('YYYY年M月D日 星期d ') + new Date(item.pubDate).toTimeString().split("(")[0]}\n`+'分割4'+`${cqimgpath.length ? `${cqimgpath.join('')}` : ''}`;
//`${cqimgpath.length ? `媒体(${cqimgpath.length}张图片)：\n${images3}` : ''}`+
module.exports = xuanzeneirong;