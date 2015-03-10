/*
 * 作者：龙仕云  2015-2-05
 *  格言的维护。
 *
 */
var express = require('express');
var db = require('../db');
var wxconfig = require('../wxconfig');


var router = express.Router();



router.get('/add',wxconfig.wx,function(req,res,next){
  var txt = req.query.txt;
  res.loadview('cost_add.html',{txt:txt},true);
});

router.post('/add',function(req,res,next){
  var cos_price = req.body.cos_price || 0;
  var cos_name = req.body.cos_name;
  var cos_tag = req.body.cos_tag;
  var price_style = req.body.price_style; //=off 为支出
  var loc_guid = req.body.loc_guid||''; //位置
  
  if (price_style == 'off') cos_price = cos_price * -1;
  var zguid = db.newGuid();
  
  if(loc_guid !=''){
    var array = loc_guid.split(',');
    var lat = array[0];
    var lng = array[1];
    db.newLocation(4/*表示我的花销*/,lat,lng,zguid,function(err,loc_guid){
      //写入库内
      var myloc_guid;
      if(!err) myloc_guid = loc_guid;
      db.exec('insert into cost(cos_guid,cos_name,cos_price,cos_tag,loc_guid) values(?,?,?,?,?)',
          [zguid,cos_name,cos_price,cos_tag,myloc_guid],function(err){
        res.msgBox(!err?"保存成功(有位置)":"保存失败(有位置)",true);
      });
    });
  }
  else{
    db.exec('insert into cost(cos_guid,cos_name,cos_price,cos_tag) values(?,?,?,?)',
          [zguid,cos_name,cos_price,cos_tag],function(err){
    
      res.msgBox(!err?"保存成功":"保存失败",true);
    });
  };
});

//
//增加花销的图片
//
router.get('/addimage',function(req,res,next){
  var img_guid = req.query.img_guid;
  db.query('select cos_guid,cos_name,cos_images from cost order by cos_time desc limit 0,5 ',function(err,rows){
    if(!err){
      res.loadview('cost_addimage.html',{rows:rows,img_guid:img_guid},true);
    }
    else{
      res.msgBox('读取我的花销出错',true); 
    }
  });
});

router.post('/addimage',function(req,res,next){
  var img_guid = req.body.img_guid;
  var cos_guid = req.body.cos_guid;
  var cos_images = req.body.cos_images;
  
  cos_images = cos_images==''?img_guid:cos_images+',' + img_guid;
  
  db.exec('update cost set cos_images=? where cos_guid=?',[cos_images,cos_guid],function(err){
    if(!err){        
      db.exec('update image set img_style=4,img_content=? where img_guid=?',[cos_guid,img_guid],function(err){
        res.msgBox(!err?'保存图片到我的花销了':'回写到图片库信息出错，但花销关联还在。'+err,true);
      });
    }
    else{
      res.msgBox('花销关联图片出错',true);  
    };    
  });
});

router.get('/',function(req,res,next){
  var curpage = req.query.page || 1;
  var startpage = (curpage-1)*20;
  
  db.query('select cos_name,cos_price,cos_time,cos_tag,cos_images,foer_guid, ' + 
           'loc_guid from cost order by cos_time desc limit ?,20',
           [startpage],function(err,rows,db){
    if(!err){
      db.get('select count(*) as rowcount,sum(cos_price) as totle from cost',function(err,row){
        res.loadview('showcost.html', {rows:rows,
                                        curpage:curpage,
                                        rowcount:row.rowcount,
                                        totle:parseInt(row.totle)});
      
      });
        
    }
    else
      res.loadview('showcost.html', {rows:[],curpage:1,rowcount:0,totle:0});
  });   
});


module.exports = router;