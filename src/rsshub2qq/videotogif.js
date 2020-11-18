const gify = require("gify");
const logger = require('../logger');
const VideoLength = require('video-length');
//const imagemin = require('imagemin'),
//    const imageminGifsicle = require('imagemin-gifsicle'),
//        const filesystem = require('fs');
const videotogif = async(input, output, xiangduilulujing, video, width = -1, colors) => {
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
                    rate: 15
                };
                break;
            case 2:
                logger.info("超高质量：" + parseInt(video_length.duration));
                opts = {
                    width: 500,
                    height: 500,
                    color: 255,
                    rate: 15
                };
                break;
            case 3:
            case 4:
                logger.info("高质量：" + parseInt(video_length.duration));
                opts = {
                    width: 400,
                    height: null,
                    color: 255,
                    rate: 12
                };
                break;
            case 5:
            case 6:
                logger.info("中质量：" + parseInt(video_length.duration));
                opts = {
                    width: 400,
                    height: null,
                    color: 128,
                    rate: 12
                };
                break;
            case 7:
            case 8:
            case 9:
                logger.info("低质量：" + parseInt(video_length.duration));
                opts = {
                    width: 400,
                    height: null,
                    color: 128,
                    rate: 8
                };
                break;
            default:
                logger.info("超低质量：" + parseInt(video_length.duration));
                opts = {
                    width: 400,
                    height: null,
                    color: 64,
                    rate: 3
                };
                break;
        }
        return await new Promise((resolve, reject) => {
            gify(input, output, xiangduilulujing, opts, video, function(err) {
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



//图片压缩
//https://www.npmjs.com/package/image-conversion npm i image-conversion 
//https://www.npmjs.com/package/@nitra/minify-image
//https://www.npmjs.com/package/gifsicle npm i gifsicle

//测量图片大小 https://github.com/calipersjs/calipers npm install --save calipers calipers-png npm i calipers-gif
//https://www.jianshu.com/p/8a0d1285f5f8 利用imagemin-gifsicle与gulp压缩本地gif



// 由于我的命令行写法类似于：gulp minifyTask -D:\...\abc.gif，
// process.argv 是Nodejs内部变量，负责返回命令行所有参数，最后一个就是 -D:\...\abc.gif，也就是图片路径
//var gulp = require('gulp'),


/*var path = process.argv[process.argv.length - 1].slice(1);

function minifyTask() {
    var colorsNumber = 128; // 由于此值范围是2~256，所以我取中点是128，即按照二分法取值
    var offset = 128; // 修正量
    var bestColorsNumber; // 最佳color值

    function minifyGif(isBestColorsNumber) {
        imagemin([path],
            path.match(/.+\\/)[0] + 'min', {
                use: [imageminGifsicle({
                    optimizationLevel: 3,
                    colors: colorsNumber
                })]
            }
        ).then(() => {
            filesystem.stat(path.match(/.+\\/)[0] + 'min' + path.match(/\\[^\\]+$/)[0], function(error, stats) {
                var newSize = stats.size / 1024 / 1024;

                console.log('当前色彩值 ==> ' + colorsNumber + ' 当前尺寸 ===> ' + newSize + 'MB');

                if (isBestColorsNumber !== true) {
                    offset = offset / 2;

                    if (offset !== 0.5) {
                        if (newSize > 4) {
                            colorsNumber = colorsNumber - offset;
                        } else {
                            bestColorsNumber = colorsNumber;
                            colorsNumber = colorsNumber + offset;
                        }

                        minifyGif();
                    } else {
                        colorsNumber = bestColorsNumber;

                        minifyGif(true);
                    }
                } else {
                    filesystem.rename(path.match(/.+\\/)[0] + 'min' + path.match(/\\[^\\]+$/)[0], path);
                    console.log(path + '已经成功压缩到4MB以下，最合适的color值是' + colorsNumber);
                }
            });
        });
    }

    minifyGif();
}*/

//gulp.task(minifyTask);


/**
 https://www.cnblogs.com/xingmeng/p/5039895.html 
 php语音转换需要安装ffmpeg文件

参考地址:

http://thierry-xing.iteye.com/blog/2017864

http://diogomelo.net/blog/11/encoder-codec-id-86017-not-found-output-stream-00-compile-ffmpeg-yourself

 

ubuntu上安装ffmpeg
博客分类：
 
其它
 
安装包和主要步骤：

 

1. 首先安装系统基础环境
RHEL & CentOS 系列：yum install -y automake autoconf libtool gcc gcc-c++

Debian & Ubuntu 系列：apt-get install automake autoconf libtool gcc gcc-c++

 

2. 下载最新的FFMpeg源码包
FFMpeg官方下载地址：http://ffmpeg.org/download.html。

一般直接使用最新版本，下载完成后解压缩，进入源码文件夹，运行“./configure --help”查看帮助，这里主要是为了确认需要安装的扩展，有些扩展默认是已经开启的，有些是需要单独下载扩展源码包进行编译的。以我的需求为例，需要单独编译yasm、lame、OenCore AMR、AmrNB和AmrWB，其中lame是MP3解码器。

 

3. 编译所需源码包
从各个官方地址下载上述五种源码包，为了保证兼容最新版本的ffmpeg，请务必也下载最新版本的源码：

yasm：http://yasm.tortall.net/Download.html

lame：http://lame.sourceforge.net/download.php

wget https://jaist.dl.sourceforge.net/project/lame/lame/3.100/lame-3.100.tar.gz
tar -xzvf lame-3.100.tar.gz
cd lame-3.100
./configure
make -j4
make install

OenCore AMR：http://sourceforge.net/projects/opencore-amr

wget https://jaist.dl.sourceforge.net/project/opencore-amr/opencore-amr/opencore-amr-0.1.5.tar.gz
chmod 755 opencore-amr-0.1.5.tar.gz
tar -xzvf opencore-amr-0.1.5.tar.gz
cd opencore-amr-0.1.5
./configure --enable-shared=no --enable-static=yes
make -j4 && 
make install


AmrNB & AmrWB：http://www.penguin.cz/~utx/amr

wget http://www.penguin.cz/~utx/ftp/amr/amrnb-11.0.0.0.tar.bz2
tar xvjf amrnb-11.0.0.0.tar.bz2
cd amrnb-11.0.0.0
./configure
make -j4
make install

wget http://www.penguin.cz/~utx/ftp/amr/amrwb-11.0.0.0.tar.bz2
tar xvjf amrwb-11.0.0.0.tar.bz2
cd amrwb-11.0.0.0
./configure
make -j4
make install

wget https://jaist.dl.sourceforge.net/project/opencore-amr/vo-amrwbenc/vo-amrwbenc-0.1.3.tar.gz
tar -xzvf vo-amrwbenc-0.1.3.tar.gz
cd vo-amrwbenc-0.1.3
./configure
make -j4
make install
https://blog.csdn.net/tuyooc/article/details/46799635


分别解压缩并编译上述源码包，直接使用“./configure && make && make install”即可。

 

4. 编译FFMpef
回到刚才的FFMpeg源码目录，打开所需扩展并且编译FFMpeg：
https://www.jianshu.com/p/37c597ed1582 ffmpeg的一些坑

    ./configure \
        --prefix="$HOME/ffmpeg_build" \
        --pkg-config-flags="--static" \
        --extra-cflags="-I$HOME/ffmpeg_build/include" \
        --extra-ldflags="-L$HOME/ffmpeg_build/lib" \
        --bindir="/usr/local/bin/" \
        --enable-gpl \
        --enable-libass \
        --enable-libfdk-aac \
        --enable-libfreetype \
        --enable-libmp3lame \
        --enable-libopus \
        --enable-libtheora \
        --enable-libvorbis \
        --enable-libvpx \
        --enable-libx264 \
        --enable-nonfree \
        --enable-version3 \
        --disable-ffplay \
        --disable-ffprobe \
        --disable-yasm \
        --enable-libopencore-amrnb \
        --enable-libopencore-amrwb

///  ./configure --enable-libmp3lame --enable-libopencore-amrnb --enable-libopencore-amrwb --enable-version3 --enable-shared

make -j4 
make install

ldconfig

最后写入config后，终端运行ffmpeg命令，出现success和已安装的扩展，则运行成功。

 

5. 可能遇到的问题
ffmpeg默认安装目录为“/usr/local/lib”，有些64位系统下软件目录则为“/usr/lib64”，编译过程中可能会出现“ffmpeg: error while loading shared libraries: libmp3lame.so.0: cannot open shared object file: No such file or directory”等类似的错误，解决办法是建立软链接或者移动库文件到相应的目录：

ln -s /usr/local/lib/libmp3lame.so.0.0.0 /usr/lib64/libmp3lame.so.0

mv /usr/local/lib/libmp3lame.so.0.0.0 /usr/lib64/libmp3lame.so.0

 

6. 使用方法
MP3转换AMR： ffmpeg -i 1.mp3 -ac 1 -ar 8000 1.amr

AMR转换MP3： ffmpeg -i 1.amr 1.mp3

 

遇到问题及解决：

 

1. ERROR: libopenjpeg not found

http://code.google.com/p/openjpeg/downloads/detail?name=openjpeg-1.5.1.tar.gz&can=2&q=

下载openjpeg-1.5.1的代码，注意不要下载openjpeg-2.0的，否则ffmpeg跟openjpeg的接口不支持，编译会处错误。

configure 
make，make install

找到头文件是在/usr/local/include/openjpeg-1.5.1下面，而ffmpeg在连接的时候，其实是/usr/local/include，所以提示说“ERROR: libopenjpeg not found”。将/usr/local/include/openjpeg-1.5.1下面的头文件“openjpeg.h”拷贝到/usr/local/include下面。

 

1，x264也是有这个问题，x264.h这个文件要放在/usr/local/include下，而不是在/usr/local/下单独建个子目录放。 其他的库都是在make install的时候自己建的子文件夹。

需要将libx264的库文件拷贝到/usr/local/lib下
或者直接在configure的时候，改变路径，如下所示：
./configure --includedir=/usr/local/include --libdir=/usr/local/lib --enable-shared
即可。

 

2. ERROR:libfdk_aac not found

http://sourceforge.net/projects/opencore-amr/?source=directory

下载fdk-aac-0.1.1.tar.gz 

执行 

configure

make

make install

 

3. ERROR:libilbc not found

https://github.com/dekkers/libilbc

git clone git://github.com/dekkers/libilbc.git

解压

安装cmake，如下所示

sudo apt-get install cmake

创建一个build目录，执行：
cd build
cmake ..           (这里的..意思是，如果是一个.表示CMakeLists.txt在当前路径下，两个..表示CMakeLists.txt在上一层目录下）

cmake install ..
make                （在build/bin下会找到可执行文件。）

make install      （将生成的库拷贝到linux相关目录下）

 

4. ERROR: libmp3lame >= 3.98.3 not found

sudo apt-get install libmp3lame-dev

 

5. ERROR: libopencore_amrnb not found

sudo apt-get install libx264-dev libxvidcore-dev libopencore-amrwb-dev libopencore-amrnb-dev libfaad-dev libfaac-dev libmp3lame-dev \
libtwolame-dev liba52-0.7.4-dev libcddb2-dev libcdaudio-dev libcdio-cdda-dev libvorbis-dev libopenjpeg-dev

(5) git chone git://git.videolan.org/x264.git
configure
make && make install
(6) ERROR: libvo_aacenc not found
http://sourceforge.net/projects/opencore-amr/files/vo-aacenc/vo-aacenc-0.1.2.tar.gz/download
(7) ERROR: libvo_amrwbenc not found
http://sourceforge.net/projects/opencore-amr/files/vo-amrwbenc/
(8) ERROR: libvpx decoder version must be >=0.9.1
http://code.google.com/p/webm/downloads/detail?name=libvpx-v1.1.0.tar.bz2&can=2&q=
(9)编译 ffplay 需要 libsdl1.2-dev 库：
sudo apt-get install libsdl1.2-dev
（10）ffmpeg: error while loading shared libraries: libavdevice.so.52: cannot open shared object file
Solution:
Search the file libavdevice.so.52 on the server using the ‘find’ command

1
# find / -name libavdevice.so.52
You need to add the path to the directory the file is in, in the ‘ld.so.conf’ file. If for example the file is located under “/usr/local/lib” directory, execute

1
# vi /etc/ld.so.conf
and add the following at the bottom of the file

 	
/usr/local/lib
 

 

7. Encoder (codec id 86017) not found for output stream #0.0
解决方案：http://diogomelo.net/blog/11/encoder-codec-id-86017-not-found-output-stream-00-compile-ffmpeg-yourself
 */