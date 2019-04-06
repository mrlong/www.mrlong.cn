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
var config = require('../config');


module.exports = function(image, req, res, next){
  //console.log(image);
  var fromOpenID = image.FromUserName;
  var PicUrl = image.PicUrl;

  if (fromOpenID === 'o5Lr2t1c6b0JV0xidlxbClJa56s4'){
    
 		download(PicUrl,function(err,img_guid){
          
          var content = '';
          //content.push({title:'选择你要做什么？'});
          
          content = content + '\n\r' + '1、书法绘画' + config.domain + '/shf/editshfinfo?img_guid=' + img_guid;
          content = content + '\n\r' + '2、添加到我的足迹' + config.domain + '/footer/addimage?img_guid=' + img_guid;
          content = content + '\n\r' + '3、添加读书笔记' + config.domain + '/books/notes/addimage?img_guid=' + img_guid;
          content = content + '\n\r' + '4、增加图片的说明备注' + config.domain + '/images/addinfo?img_guid=' + img_guid;
          content = content + '\n\r' + '5、增加到我的花销' + config.domain + '/cost/addimage?img_guid=' + img_guid;
          content = content + '\n\r' + '6、上传错了，现在删除掉。' + config.domain + '/images/del/' + img_guid;

                    
 	      res.reply(!err?content:img_guid);
 		}); 			
  }
  else{
  	res.reply('不是你上传的请不要使用。');
  }  
  
};