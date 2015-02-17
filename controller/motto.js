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
      res.render('./views_pc/showmotto.html', {rows:rows});  
    }
    else
      res.render('./views_pc/showmotto.html', {rows:[]});
  });
  

});


//增加
router.post('/add',function(req,res,next){
  if(!req.session.adminlogin)
  {
    res.redirect('show');
    return true;  
  };
  
  var mot_txt = req.body.mot_txt;
  var mot_time = req.body.mot_time;
  var mot_from = req.body.mot_from;
  
  db.exec('insert into motto(mot_txt,mot_time,mot_from) values(?,?,?)',[mot_txt,mot_time,mot_from],function(err){
    res.redirect('show');  
  });

});

//删除
router.post('/del',function(req,res,next){
  if(req.session.adminlogin){
    var id = req.body.mot_id;
    db.exec('delete from motto where mot_id=?',[id],function(err){
      if(!err){
        res.json({success:true,msg:'删除成功'});
      }
      else{
        res.json({success:false,msg:'删除不成功'}); 
      }
    });
  }
  else{
    res.json({success:false,msg:'不能删除'});
  }
});



module.exports = router;

