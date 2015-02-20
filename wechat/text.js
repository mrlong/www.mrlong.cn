//
// 作者：龙仕云  2014-3-18
// 文本信息推送器 
//

var config = require('../config');

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
  
  
  res.reply(content);
  
};