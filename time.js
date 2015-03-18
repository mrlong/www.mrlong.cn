//
// 龙仕云 2015-3-18
// 定时器
//

var schedule = require("node-schedule");  //定时器
var db = require('./db');
var util = require('./util');


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
  });
};

