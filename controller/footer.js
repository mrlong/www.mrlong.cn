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
  var mywhere = req.session.adminlogin?'(1=1)':'(foer_viewstyle=0)';
  db.query('select * from footer where '+ mywhere +' order by foer_time desc limit ?,20',[startpage],function(err,rows,db){
    if(!err){
      db.get('select count(*) as mycount from footer where ' + mywhere,function(err,row){
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
          [zguid,txt,time,loc_guid,style,tag],function(err,db){
    
    if(!err && loc_guid != ''){
      db.run('update location set loc_style=3,loc_content=? where loc_guid=?',[zguid,loc_guid]);
    };
    
    res.msgBox(!err?'保存成功':'保存出错'+err,true);
    
  });
});

router.get('/addimage',function(req,res,next){
  var img_guid = req.query.img_guid;
  if(img_guid){
    db.query('select foer_guid,foer_txt,foer_images from footer order by foer_time desc limit 0,5 ',function(err,rows){
      res.loadview('footer_addimage.html',{img_guid:img_guid,rows:rows},true);
    });
    
  }
  else{
    res.msgBox('图片的guid为空',true);
  }
});

router.post('/addimage',function(req,res,next){
  var img_guid  = req.body.img_guid;
  var foer_images = req.body.foer_images || '';
  var foer_guid = req.body.footer;
  
  if( img_guid && foer_guid){
    var myimages = foer_images==''?img_guid:foer_images + ',' + img_guid; 
    db.exec('update footer set foer_images=? where foer_guid=?',[myimages,foer_guid],function(err){
      if(!err){        
        db.exec('update image set img_style=1,img_content=? where img_guid=?',[foer_guid,img_guid],function(err){
          res.msgBox(!err?'保存图片到我的足迹了':'回写到图片库信息出错，但足迹关联还在。',true);
        });
      }
      else{
        res.msgBox('足迹关联图片出错',true);  
      }   
    });  
  }
});


module.exports = router;








