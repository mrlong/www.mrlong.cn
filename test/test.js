

var down = require('../wechat/downloadfile');

var PicUrl = 'http://mmbiz.qpic.cn/mmbiz/lMHkuTribIDj0aELcdFUV1bFWWQIAAFXFrBibv41sG9vnYibmZacpkcbD8a1H2kgib3Y1BXE8tQNgUJy8t7fSpOvEg/0';
down(PicUrl,function(err,msg){
	console.log(msg);
});