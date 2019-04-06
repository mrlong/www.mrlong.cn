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

  //content.push({
  //  title:'选择你要做什么？',
  //  url:config.domain});
  
  //是数字
  if(!isNaN(input)){
    
    content.push({
      title: '1、我的花销',
      url: config.domain + '/cost/add?txt=' + input
    });
    
    console.log(content);
    res.reply(content);
  }
  else{
  
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
    
    content.push({
      title: '4、事件提醒',
      url: config.domain + '/remind/add?txt=' + input
    });
    
    //输入的日期格式说明可能是提取misfit内容
    if(input.length>2 && input.indexOf('-')>=0){
      var numlist = input.split('-');
      var y = numlist.length == 3 ? numlist[0] : '' + new Date().getYear();
      var m = numlist.length == 3 ? numlist[1] : numlist[0]; 
      var d = numlist.length == 3 ? numlist[2] : numlist[1];
      var mydate = (y.length == 2 ? '20' + y : y) + '-' + ( m.length==2 ? m : '0' + m ) + '-' + (d.length == 2 ? d : '0'+ d );
      
      //直接转向到
      var redirectUri='http://www.mrlong.cn/fit/data?view=1&startdate=' +  mydate +'&enddate=' + mydate;
      var url = 'https://api.misfitwearables.com/auth/dialog/authorize?response_type=code&client_id=pYPABsuKSXpOByXr&redirect_uri=' +
                redirectUri + '&scope=public,birthday,email,tracking,session,sleeps';
      
      content.push({
        title: '5、提取misfit数据',
        url: url 
      });
      res.reply(content);
    }
    
    //直接显示姓名电话会直难过点。但速度会慢
    else if (input.length ==3 || input.length ==2){
      db.query('select fri_name,fri_guid,fri_moblie from friend where fri_name=?',[input],function(err,rows){
        if(!err && rows.length>0){
          content.push({
            title: '5、我要找人 ' + rows[0].fri_name + ' ' + rows[0].fri_moblie,
            url: config.domain + '/friend/search?txt=' + input
          });      
        }
        else{
          content.push({
            title: '5、我要找人',
            url: config.domain + '/friend/search?txt=' + input
          }); 
        };
        res.reply(content);  //因为异步，所以将移到这地方
      });
    
    }
    else{
      content.push({
          title: '5、我要找人',
          url: config.domain + '/friend/search?txt=' + input
      }); 
      res.reply(content);
    };
    //end
  };
    

};