process.env.TZ='Asia/Shanghai';
const rss = require('./src/rsshub2qq/rss');
//转推首次使用，需要人工去访问下https://rsshub.app/twitter/user/XXXXXXXXX
rss(); //索引0为QQ号。索引1为模式选择：0推主的所有推(所有推主发的推文)，1仅转推主的主题推，2仅转推，3无回复推，4全部推文。内容选择：0仅要含图片的推，1仅要不含图片的推，2仅要链接，3全部。关键词选择指定的推文