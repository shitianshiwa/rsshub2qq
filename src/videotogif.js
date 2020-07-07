const gify = require("gify");
const logger = require('../logger');
const VideoLength = require('video-length');
const videotogif = async (input, output, xiangduilulujing, video, width = -1, colors) => {
    var video_length;

    // Get video duration if user didn't pass it

    /*
    https://www.runoob.com/jsref/jsref-isfinite.html
    isFinite() 函数用于检查其参数是否是无穷大。
    提示： 如果 number 是 NaN（非数字），或者是正、负无穷大的数，则返回 false。
    语法
    isFinite(value)
    参数	描述
    value	必需。要检测的数字
    */
    if (typeof video_length !== 'number' && !isFinite(video_length)) {
        video_length = await VideoLength(input, {
            bin: 'mediainfo',
            extended: true
        });
    }
    logger.info("持续时间：" + video_length.duration);
    logger.info("宽：" + video_length.width);
    logger.info("高：" + video_length.height);
    logger.info("帧率: " + video_length.fps);
    logger.info("平均混合码率: " + video_length.bitrate);
    logger.info("文件大小: " + video_length.size);
    var opts;
    logger.info("质量分级: " + parseInt(video_length.duration));
    switch (parseInt(video_length.duration)) {
        case 0:
        case 1:
            logger.info("极高质量：" + parseInt(video_length.duration));
            opts = {
                width: video_length.width,
                height: video_length.height,
                color: 255,
                rate: 12
            };
            break;
        case 2:
            logger.info("超高质量：" + parseInt(video_length.duration));
            opts = {
                width: 500,
                height: 500,
                color: 255,
                rate: 10
            };
            break;
        case 3:
        case 4:
            logger.info("高质量：" + parseInt(video_length.duration));
            opts = {
                width: 400,
                height: null,
                color: 128,
                rate: 8
            };
            break;
        case 5:
        case 6:
            logger.info("中质量：" + parseInt(video_length.duration));
            opts = {
                width: 400,
                height: null,
                color: 80,
                rate: 6
            };
            break;
        case 7:
        case 8:
        case 9:
            logger.info("低质量：" + parseInt(video_length.duration));
            opts = {
                width: 300,
                height: null,
                color: 40,
                rate: 4
            };
            break;
        default:
            logger.info("超低质量：" + parseInt(video_length.duration));
            opts = {
                width: 300,
                height: null,
                color: 20,
                rate: 2
            };
            break;
    }
    return await new Promise((resolve, reject) => {
        gify(input, output, xiangduilulujing, opts, video, function (err) {
            logger.info("gify:" + err);
            if (!err) {
                logger.info("true");
                //logger.info("done");
                resolve(true);
            } else {
                //https://www.cnblogs.com/fozero/p/6959896.html JS中将一个值转换为字符串的3种方法
                if (String(err).search("does not contain any stream") != -1) {
                    logger.info("no music");
                    //logger.error("v2g:" + err);
                    resolve("no music");
                } else {
                    logger.info("false");
                    //logger.error("v2g:" + err);
                    resolve(false);
                }
            }
        });
    });
}
//videotogif('./videos1/9.mp4', './videos2/10-out.gif', ".", -1, '255');
module.exports = videotogif;


/*
带有选项：

var  opts  =  { 
  width：300 
} ;

gify（'out.mp4' ， 'out.gif' ， opts ， function （err ）{ 
  if  （err ） throw  err ; 
} ）;
选件
width 最大宽度[500]
height 最大高度[无]
delay 帧之间[自动]
rate 帧频[10]
start 起始位置，以秒或hh​​：mm：ss [.xxx] [0]
duration 要转换的视频长度，以秒或hh​​：mm：ss [.xxx] [自动]
*/