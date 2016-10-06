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
      db.get('select count(*) as mycount,sum(foer_price) as totle from footer where ' + mywhere,function(err,row){
        res.loadview('showfooter.html',{rows:rows,rowcount:row.mycount,totle:row.totle,curpage:page}); 
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
  var time = req.body.time || '';
  var style = req.body.style || 0;
  var price = req.body.price;
  var fri_guid = req.body.friend_guid;  
  var fri_name = req.body.friend_name;
  var addtocost = req.body.addtocost; //=1增加 0=不增加

  
  var zguid = db.newGuid();
  if(time==''){
    db.exec('insert into footer(foer_guid,foer_txt,foer_time,loc_guid,foer_viewstyle,foer_tag,foer_price,foer_who,foer_whoname) '+
            'values(?,?,datetime("now","localtime"),?,?,?,?,?,?)',
          [zguid,txt,loc_guid,style,tag,price,fri_guid,fri_name],function(err,indb){
    
    if(!err && loc_guid != ''){
      indb.run('update location set loc_style=3,loc_content=? where loc_guid=?',[zguid,loc_guid]);      
    };
    
    //费用明细就不要写了。 2015-11-11
    //if (!err && addtocost=='1'){
    //  indb.run('insert into cost(cos_guid,cos_name,cos_price,cos_tag,loc_guid,foer_guid) values(?,?,?,?,?,?)',
    //    [db.newGuid(),txt,price * -1,'来自足迹',loc_guid,zguid]);
    //}
    
    res.msgBox(!err?'保存成功':'保存出错'+err,true);
    
    }); 
  }
  else {
    db.exec('insert into footer(foer_guid,foer_txt,foer_time,loc_guid,foer_viewstyle,foer_tag,foer_price,foer_who,foer_whoname) ' + 
            ' values(?,?,?,?,?,?,?,?,?)',
          [zguid,txt,time,loc_guid,style,tag,price,fri_guid,fri_name],function(err,indb){
    
    if(!err && loc_guid != ''){
      indb.run('update location set loc_style=3,loc_content=? where loc_guid=?',[zguid,loc_guid]);      
    };
      
    //if(!err && addtocost=='1'){
    //  indb.run('insert into cost(cos_guid,cos_name,cos_price,cos_tag,loc_guid,foer_guid) values(?,?,?,?,?,?)',
    //    [db.newGuid(),txt,price * -1,'来自足迹',loc_guid,zguid]);
    //  }
    
    res.msgBox(!err?'保存成功':'保存出错'+err,true);
    
    });
  }
});

//
//增加足迹的图片
//
router.get('/addimage',function(req,res,next){
  var img_guid = req.query.img_guid;
  if(img_guid){
    db.query('select foer_guid,foer_txt,foer_images,foer_price from footer order by foer_time desc limit 0,5 ',function(err,rows){
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
  var price = req.body.price;
  
  if( img_guid && foer_guid){
    var myimages = foer_images==''?img_guid:foer_images + ',' + img_guid; 
    db.exec('update footer set foer_images=?,foer_price=? where foer_guid=?',[myimages,price,foer_guid],function(err){
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

//
//删除内容
//
router.post('/del/:guid',function(req,res,next){
  
  var guid = req.params.guid;
  
  //权限，有没有登录。
  if(!req.session.adminlogin){
    res.json({success:false,msg:'请登录才能修改'});
    return;
  };
  
  //关联的资源就不删除了，删除都是由于增加错的 2015-11-11
  db.query('delete from footer where foer_guid=?',guid,function(err){
    res.json({success:!err,msg:err?'删除出错':'删除成功'});
    return; 
  });
  
});

//
//编辑内容
//
router.post('/edit/:guid',function(req,res,next){
  var guid = req.params.guid;
  var txt = req.body.txt; //要更新的内容
  
  //权限，有没有登录。
  if(!req.session.adminlogin){
    res.json({success:false,msg:'请登录才能修改'});
    return;
  };
  
  db.exec('update footer set foer_txt=? where foer_guid=?',[txt,guid],function(err){
      res.json({success:!err,msg:err?'编辑出错':'编辑成功'});
      return;    
  });

});


module.exports = router;









