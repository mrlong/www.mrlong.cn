//
// 作者：龙仕云  2014-3-18
// 文本信息推送器 
//



module.exports = function(message, req, res, next){
  //console.log(message);
  
  var input = (message.Content || '').trim();

  var content = [];
  //content.push({
  //  title: '格言',
  //  url: config.domain + '/motto/add?txt=' + input
  //});
  
  content.push({
    title: '读书笔记',
    url: config.domain + '/books/notes/add?txt=' + input
  });
  
  res.reply(content);
  
};