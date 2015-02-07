/*
 * 作者：龙仕云  2015-2-05
 *  格言的维护。
 *
 */
var express = require('express');
var db = require('../db');


var router = express.Router();

//取出当前最新的内容。
// backcall 参数：
//  err
//  txt  格言内容。
router.get('/getcurtxt',function(req,res,next){  
  db.query('select mot_txt from motto order by mot_id desc',function(err,rows){
    if(!err && rows.length>0){
      res.json({success:true,txt:rows[0].mot_txt});
    }
    else{
      res.json({success:false,msg:''}); 
    };
  });
});


//显示格言
router.get('/show',function(req,res,next){
  db.query('select * from motto order by mot_id desc',function(err,rows){
    if(!err){
      res.render('./showmotto.html', {rows:rows});  
    }
    else
      res.render('./showmotto.html', {rows:[]});
  });
  

});
module.exports = router;

