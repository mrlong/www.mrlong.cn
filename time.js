//
// 龙仕云 2015-3-18
// 定时器
//

var schedule = require("node-schedule");  //定时器
var db = require('./db');
var util = require('./util');
var cheerio = require('cheerio');


//1.检查提醒
var doremind=function(){
  db.query("select rem_txt,rem_guid from remind  where  (rem_issend='false') and " +
          "(strftime('%s',rem_time)-strftime('%s',datetime('now','localtime')))<120 and " +
          "(strftime('%s',rem_time)-strftime('%s',datetime('now','localtime'))) > 0 ",function(err,rows){
    
    if(!err && rows.length>0){
      var opt={
        from : "mrlong@mrlong.cn",
        to:"mrlong@mrlong.cn",
        subject: rows[0].rem_txt
      }; 
      util.sendmail(opt,function(err){
        if(!err) db.exec("update remind set rem_issend='ture' where rem_guid=?",[rows[0].rem_guid]);
      });
    }
  });
};

//
//龙子开的报名内容提醒
//
var dolongzikai=function(){
  
  var url = 'http://hzcs.qsng.cn/hz-bsp/hz/apply-front!netApply.action?clazzId=89F7BE00B1F04FDD9DFC72C6E3888680&area=3';
  util.httpdata(url,function(err,data){
    var $ = cheerio.load(data, {decodeEntities: false});
    var txt = $('table.tb').text();
    
    if (txt.indexOf('报名进行中')>0 || txt.indexOf('名额已满')==-1 ) {
      
      var opt={
        from : "mrlong@mrlong.cn",
        to:"mrlong@mrlong.cn,hzftyh@163.com",
        subject: '2017年速写有名额，快报名',
        html:$('table.tb').html()
      }; 
      util.sendmail(opt);
    }
    
  });
};

exports.do=function(){
  //定时器
  var rule = new schedule.RecurrenceRule();
  var times = [1];  //1分钟执行一次
  //for(var i=1; i<30; i++){
  //　　　　times.push(i);
  //}
  rule.second = times;
  var j = schedule.scheduleJob(rule, function(){
    //console.log('sss');
    doremind();
    dolongzikai();  //龙子开报名
  });
};

