//
// 处理图片情况
//
//

// message为图片内容
// { ToUserName: 'gh_d3e07d51b513',
// FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
// CreateTime: '1359124971',
// MsgType: 'image',
// PicUrl: 'http://mmsns.qpic.cn/mmsns/bfc815ygvIWcaaZlEXJV7NzhmA3Y2fc4eBOxLjpPI60Q1Q6ibYicwg/0',
// MediaId: 'media_id',
// MsgId: '5837397301622104395' }
//http://mmbiz.qpic.cn/mmbiz/lMHkuTribIDj0aELcdFUV1bFWWQIAAFXFrBibv41sG9vnYibmZacpkcbD8a1H2kgib3Y1BXE8tQNgUJy8t7fSpOvEg/0

var download = require('./downloadfile');


module.exports = function(image, req, res, next){
  //console.log(image);
  var fromOpenID = image.FromUserName;
  var PicUrl = image.PicUrl;

  if (fromOpenID === 'o5Lr2t1c6b0JV0xidlxbClJa56s4'){
 		download(PicUrl,function(err,msg){
 				res.reply(msg);
 		}); 			
  }
  else{
  	res.reply('不是你上传的请不要使用。');
  }  
  
};