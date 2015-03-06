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
    db.query('select fri_guid,fri_name from friend where fri_name like ?  order by fri_usetime desc',['%' + searchtxt + '%'],function(err,rows){
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
    db.query('select fri_guid,fri_name from friend  order by fri_usetime desc limit 0,10',function(err,rows){
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



module.exports = router;