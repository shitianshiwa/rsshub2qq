const bot = require('../bot');
const node_localStorage = require('node-localstorage').LocalStorage;
const rsstemp = new node_localStorage('./src/rsshub2qq/rsstemp');
//const logger = require('../logger');
const rsslist2 = require('./db/rss2.json');
//索引0为QQ号。
const s1 = ['仅转推主的全部推文', '仅转推主的主题推', '仅转推（排除推主自己的推文）', '无回复推文(可能会误筛选掉转发回复推)', '全部推文(推主发的主题推，转发别人推，回复别人的推)']; //索引1为模式选择：0仅转推主的推，1仅转推主的主题推，2仅转推，3全部推
const s2 = ['含有图片的推', '不含图片的推', '仅链接', '全部内容', '关键词模式']; //内容选择：0含有图片的推，1不含图片的推，2仅要链接，3全部内容
/*在QQ上操作的功能*/
const gongneng = (config) => {
    let user = config.user.map(temp => {
        return temp;
    });
    let group = config.group.map(temp => {
        return temp;
    });
    let groups;
    Object.keys(rsslist2).forEach(() => {
        groups = rsslist2.groups.map(str => {
            return str
        });
    });
    //var group = config.group.map(temp => { return temp; });
    bot.on('message', context => {
        let temp = "",
            temp2 = "";
        let i = 0,
            ii = 0,
            iii = 0;
        let s = "";
        for (i = 0; i < user.length; i++) {
            temp = user[i].toString().split(',');
            if (temp.length == 0) {
                break;
            }
            if (context.message_type == 'private' && temp[0] == context.user_id) {
                if (context.message == "开启转推") {
                    rsstemp.setItem(context.user_id, 1);
                    s = s + config.name + '已开启转推';
                    break;
                } else if (context.message == "关闭转推") {
                    rsstemp.setItem(context.user_id, 0);
                    s = s + config.name + '已关闭转推(后台仍会更新数据，只是不再发送)';
                    break;
                } else if (context.message == "转推") {
                    if (rsstemp.getItem(context.user_id) == '1' || rsstemp.getItem(context.user_id) == null) {
                        s = s + config.name + '已开启转推,模式：' + s1[parseInt(temp[1])] + "|内容：" + s2[parseInt(temp[2])] + "|只转含这些关键词的推特(除仅“返回链接”模式外，全部有效。为空则不过滤推文):" + temp[3] + "\n";
                    } else {
                        s = s + config.name + '已关闭转推(后台仍会更新数据，只是不再发送)';
                    }
                    break;
                }
            }
        }
        if (s != "") {
            bot('send_msg', {
                user_id: context.user_id,
                message: s
            });
        }
        s = "";
        for (i = 0; i < group.length; i++) {
            temp = group[i].toString().split(','); //订阅推特下的QQ群号
            for (ii = 0; ii < groups.length; ii++) {
                temp2 = groups[ii].toString().split(','); //有管理权限QQ群号的QQ
                if (temp.length == 0) {
                    break;
                }
                //console.log(temp[0] + ",");
                //console.log(temp2[0]);
                if (context.message_type == 'group') {
                    if (temp2[0] == temp[0]) {
                        for (iii = 1; iii < temp2.length; iii++) {
                            if (context.message == "开启转推" && temp[0] == context.group_id && temp2[iii] == context.user_id) {
                                rsstemp.setItem(context.group_id, 1);
                                s = s + config.name + '已开启转推';
                                break;
                            } else if (context.message == "关闭转推" && temp[0] == context.group_id && temp2[iii] == context.user_id) {
                                rsstemp.setItem(context.group_id, 0);
                                s = s + config.name + '已关闭转推(后台仍会更新数据，只是不再发送)';
                                break;
                            }
                        }
                        if (context.message == "转推" && temp[0] == context.group_id) {
                            if (rsstemp.getItem(context.group_id) == '1' || rsstemp.getItem(context.group_id) == null) {
                                s = s + config.name + '已开启转推,模式：' + s1[parseInt(temp[1])] + "|内容：" + s2[parseInt(temp[2])] + "|只转含这些关键词的推特(除仅“返回链接”模式外，全部有效。为空则不过滤推文):" + temp[3] + '\n';
                            } else {
                                s = s + config.name + '已关闭转推(后台仍会更新数据，只是不再发送)';
                            }
                            break;
                        }
                    }
                }
            }
        }
        if (s != "") {
            bot('send_msg', {
                group_id: context.group_id,
                message: s
            });
        }
    });
}
module.exports = gongneng;