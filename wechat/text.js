//
// 作者：龙仕云  2014-3-18
// 文本信息推送器 
//

var config = require('../config');
var db = require('../db');

module.exports = function(message, req, res, next){
  //console.log(message);
  
  var input = (message.Content || '').trim();

  var content = [];

  content.push({
    title:'选择你要做什么？',
    url:''});
  
  
  content.push({
    title: '1、读书笔记',
    url: config.domain + '/books/notes/add?txt=' + input
  });
  
  content.push({
    title: '2、格言',
    url: config.domain + '/motto/we_add?txt=' + input
  });
  
  content.push({
    title: '3、增加人脉',
    url: config.domain + '/friend/add?txt=' + input
  });
  
  //直接显示姓名电话会直难过点。但速度会慢
  if (input.length ==3 || input.length ==2){
    db.query('select fri_name,fri_guid,fri_moblie from friend where fri_name=?',[input],function(err,rows){
      if(!err && rows.length>0){
        content.push({
          title: '4、我要找人 ' + rows[0].fri_name + ' ' + rows[0].fri_moblie,
          url: config.domain + '/friend/search?txt=' + input
        });      
      }
      else{
        content.push({
          title: '4、我要找人',
          url: config.domain + '/friend/search?txt=' + input
        }); 
      };
      res.reply(content);  //因为异步，所以将移到这地方
    });
    
  }
  else{
    content.push({
          title: '4、我要找人',
          url: config.domain + '/friend/search?txt=' + input
    }); 
    res.reply(content);
  };
  //end
  
  

  
  
  
  
  
};