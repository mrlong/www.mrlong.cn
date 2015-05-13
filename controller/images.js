/*
 * 作者：龙仕云  2015-5-12
 *  blog。
 *
 */
var express = require('express');
var db = require('../db');
var markdown = require('markdown').markdown;
var path = require('path');
var config = require('../config');
var fs = require('fs');


var router = express.Router();

router.get('/',function(req,res,next){
  var page = req.query['page']||1;
  var startpage = (page-1)*10;
    
  db.query('select * from image  order by img_time desc limit ?,10',[startpage],function(err,rows,db){
    
    if(!err){
      db.get('select count(*) as rowcount from image ',function(err,row){                
        res.loadview('showimage.html', {rows:rows,curpage:page,rowcount:row.rowcount});
      });
    }
    else{
      res.msgBox('读取文章出错');
    };
  });
  
});


//删除图片
router.get('/del/:guid',function(req,res,next){
  var img_guid = req.params.guid;
  var appdir = res.locals.appdir;
  db.query('select * from image where img_guid=? and img_style=0',[img_guid],function(err,rows,db){
    if(!err && rows.length>0){
      var imgefilename = path.join(appdir,config.sqlite.images) + '/' + rows[0].img_filename;
      db.run('delete from image where img_guid=? and img_style=0',[img_guid],function(err){
        //要删除本地的文件
        if(!err){
          fs.unlink(imgefilename,function(err){
            res.msgBox(!err?'删除本地文件成功':'删除本地失败'+err,true);
          });
        }
        else{
          res.msgBox('删除失败'+err,true);
        }
      });
    }
    else{
      res.msgBox('要删除的文件不存在'+err,true);  
    }
  });
  
});



//增加图片的备注说明
router.get('/addinfo',function(req,res,next){
  var img_guid = req.query.img_guid;
  var img_info = '';
  var img_who = '';
  db.query('select img_info,img_who from image where img_guid=?',[img_guid],function(err,rows){
    if(!err && rows.length>0 && rows[0].img_info){
      img_info = rows[0].img_info;
      img_who = rows[0].img_who;
    };
    res.locals.friend_guid = img_who; 
    
    res.loadview('image_addinfo.html',{img_guid:img_guid,img_info:img_info,img_who:img_who},true);
  });
  
});
router.post('/addinfo',function(req,res,next){
  var img_guid = req.body.img_guid;
  var info = req.body.info;
  
  var fri_guid = req.body.friend_guid;  
  var fri_name = req.body.friend_name;
  
  
  db.exec('update image set img_info=?,img_who=? where img_guid=?',[info,fri_guid,img_guid],function(err){
    if(!err){
      res.msgBox('修改成功',true); 
    }
    else{
      res.msgBox('修改失败'+err,true);
    }
  });
});

//取出图片的信息
router.get('/:guid',function(req,res,next){
  var img_guid = req.params.guid;
  db.query('select * from image where img_guid=?',[img_guid],function(err,rows){
    if(!err && rows.length>0){
      var myfilename = path.join(res.locals.appdir,config.sqlite.images) +'/'+ rows[0].img_filename; 
      fs.readFile(myfilename,function(err,data){
        if(!err){
          res.set('Content-Type', 'image/jpg');
          res.status(200).send(data); 
        }
        else{
          res.status(404).send('Sorry, not find that!');   
        }
      });
      
    }
    else{
      res.status(404).send('Sorry, not find that!'); 
    }
  });
});








module.exports = router;