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

//
// 从微信过来的信息
//

router.get('/add',function(req,res,next){
  var loc_guid = req.query.loc_guid;
  res.loadview('footer_add.html',{loc_guid:loc_guid},true);
});

router.post('/add',function(req,res,next){
  var loc_guid = req.body.loc_guid;
  var txt = req.body.txt || '';
  var tag = req.body.tag || '';
  var time = req.body.time;
  var style = req.body.style || 0;
  
  var zguid = db.newGuid();
  db.exec('insert into footer(foer_guid,foer_txt,foer_time,loc_guid,foer_viewstyle,foer_tag) values(?,?,?,?,?,?)',
          [zguid,txt,time,loc_guid,style,tag],function(err){
    
    if(!err && loc_guid){
      db.exec('update location loc_style=3,loc_content=? where loc_guid=?',[zguid,loc_guid]);
    };
    
    res.msgBox(!err?'保存成功':'保存出错'+err,true);
    
  });
});


module.exports = router;



///*我的足迹 var＝11*/
//create table footer(
//  foer_guid char(36) primary key,
//  foer_txt  varchar(250),              /*内容*/
//  foer_time datetime,                  /*时间*/
//  loc_guid char(36),                   /*位置*/
//  foer_viewstyle integer default 0,    /* 0=公开  1=私有*/
//  foer_tag varchar(20)                 /*标签*/
//);




