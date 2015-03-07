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

router.get('/selected',function(req,res,next){
  var searchtxt = req.query.searchtxt;
  
  if (searchtxt){
    db.query('select fri_guid,fri_name,fri_moblie from friend where fri_name like ?  order by fri_usetime desc',['%' + searchtxt + '%'],function(err,rows){
      if(!err){
        res.json({success:true,msg:'',data:rows});
      }
      else{
        res.json({success:false,msg:'读库出错'+err}); 
      }
    });
  }
  else{
    //取出前最新的10条
    db.query('select fri_guid,fri_name,fri_moblie from friend  order by fri_usetime desc limit 0,10',function(err,rows){
      if(!err){
        res.json({success:true,msg:'',data:rows}); 
      }
      else{
        res.json({success:false,msg:'读库出错'+err});
      }
    });
    
  }
});

router.get('/selected/:guid',function(req,res,next){
  var fri_guid = req.params.guid;
  db.exec("update friend set fri_usetime=datetime(CURRENT_TIMESTAMP,'localtime') where fri_guid=?",[fri_guid]);
  res.end();
});

//
//增加我的人脉
//
router.get('/add',function(req,res,next){
  var txt = req.query.txt;
  res.loadview('friend_add.html',{txt:txt},true);
});
router.post('/add',function(req,res,next){
  var fri_name = req.body.fri_name;
  var fri_qq = req.body.fri_qq;
  var fri_moblie = req.body.fri_moblie;
  var fri_birthday = req.body.fri_birthday;
  var fri_from = req.body.fri_from;
  var fri_tag = req.body.fri_tag;
  var fri_note = req.body.fri_note;
  
  var friend_name = req.body.friend_name;
  var friend_guid = req.body.friend_guid;
  
  if (friend_guid){fri_from=fri_from+'介绍人:'+friend_name}
  
  var zguid = db.newGuid();
  db.exec('insert into friend(fri_guid,fri_name,fri_moblie,fri_qq,fri_birthday,' +
          'fri_tag,fri_from,fri_join,fri_note,fri_usetime' +
          ') values(?,?,?,?,?,?,?,?,?,datetime(CURRENT_TIMESTAMP,"localtime"))',
          [zguid,fri_name,fri_moblie,fri_qq,fri_birthday,fri_tag,fri_from,friend_guid,fri_note],function(err){
  
    res.msgBox(!err?"保存成功":"保存失败"+err,true);
  });
  
});

//
// 查找人
//
//
router.get('/search',function(req,res,next){
  var txt = req.query.txt;
  db.query('select fri_guid,fri_name,fri_moblie from friend where fri_name like ? order by fri_usetime desc limit 0,20',
           ['%'+txt+'%'],function(err,rows){
    if(!err){
      res.loadview('friend_search.html',{rows:rows,txt:txt},true);
    }
    else{
      res.msgBox('查找出错'+err,true); 
    }
  });
});






module.exports = router;