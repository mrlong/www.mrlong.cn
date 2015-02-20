/*
 *
 * 我的足迹
 *
 *  2015年 羊年初二
 *
 */

 
var express = require('express');
var db = require('../db');


var router = express.Router();

router.get('/',function(req,res,next){
  var page = req.query['page']||1;
  var startpage = (page-1)*20;
  
  //登录了管理员，全部显示，否则只显示公开的。
  var mywhere = req.session.adminlogin?'1=1':'foer_viewstyle=0';
  db.query('select * from footer where ? order by foer_time desc limit ?,20',[mywhere,startpage],function(err,rows,db){
    if(!err){
      db.get('select count(*) as mycount from footer where ?',[mywhere],function(err,row){
        res.loadview('showfooter.html',{rows:rows,rowcount:row.mycount,curpage:page}); 
      });             
    }
    else{
     res.msgBox('读取出错。'+err); 
    }      
  });    
});


module.exports = router;



