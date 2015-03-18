////////////////////////////////////////////////////////////////////////
//
// 作者：龙仕云
//  2015-3-18
//
// 提醒功能
//
///////////////////////////////////////////////////////////////////////

var express = require('express');
var db = require('../db');


var router = express.Router();

//增加
router.get('/add',function(req,res,next){
  var txt = req.query.txt;
  res.loadview('remind_add.html',{txt:txt},true);
});
router.post('/add',function(req,res,next){
  var txt = req.body.txt;
  var rem_time = req.body.rem_time;
  
  db.exec('insert into remind(rem_guid,rem_txt,rem_time) values(?,?,?)',
          [db.newGuid(),txt,rem_time],function(err){
    res.msgBox(!err?'增加提醒成功':'增加提醒失败'+err,true);
  });
  
});





module.exports = router;