/*
 *
 * 书法绘画
 * 作者：龙仕云  
 *
 */

var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var db = require('../db.js');
var util = require('../util.js');
var config = require('../config');
var API = require('../wechat/api');
var wxconfig = require('../wxconfig');

var express = require('express');
var router = express.Router();


var api = new API(config.weixin.appid,config.weixin.appsecret);

router.use('/pic',function(req,res,next){
  var appdir = res.locals.appdir;
  /*
  fs.readdir(appdir + '/public/shf', function(err, filenames){
    filenames.sort(function(val1, val2){
      //读取文件信息
      var stat1 = fs.statSync(appdir + '/public/shf/' + val1);
      var stat2 = fs.statSync(appdir + '/public/shf/' + val2);
      //根据时间从最新到最旧排序
      return stat2.mtime - stat1.mtime;
    });
    
    
    res.locals.settings['picfilenames'] = filenames;
    res.writeHead(200);
    //console.log(data);
    var tpl = ejs.compile(fs.readFileSync(path.join(appdir, 'views/showpictrue.html'),'utf-8'));
    res.end(tpl({'imgs':filenames}));     
  });
  */
  
  //从库中读取书法内容
  db.query('select * from shfimg order by ct desc ',function(err,rows){
    if(!err){
      //var tpl = ejs.compile(fs.readFileSync(path.join(appdir, 'views/showpictrue.html'),'utf-8'));
      //console.log(rows);
      //res.end(tpl({'imgs':rows}));
      //res.render('./views_pc/showpictrue', {'imgs':rows});
      res.loadview('showpictrue',{'imgs':rows});
    }
    else {
      //出错的情况
      util.errBox('显示内容出错','/');
    }
  });
  
});


//单个图片浏览
router.use('/pictrueone',function(req,res,next){
  var appdir = res.locals.appdir;
  var picname = req.query.picname;
  var tpl = ejs.compile(fs.readFileSync(path.join(appdir, 'views_pc/pictrueone.html'),'utf-8'));
  //console.log('ss'+res.locals.settings['picfilenames']);
  db.query('select * from shfimg order by ct desc',function(err,rows){
    if(!err){
      var files = [];
      rows.forEach(function(row){files.push(row.imgfile)});
      res.end(tpl({'picname':picname,'picfilenames':files}));    
    }
    else{
      util.errBox('显示出错','/'); 
    }
  });
});

//修改书法信息
router.get('/editshfinfo',wxconfig.wx,function(req,res,next){
   var img_guid = req.query.img_guid;
   var zguid = db.newGuid();
   res.loadview('editpictrue.html', {'zguid':zguid,'msg':'',img_guid:img_guid},true);
});

router.post('/editshfinfo',function(req,res,next){

  var appdir = res.locals.appdir;
  
  var img_guid = req.body.img_guid;
  var zguid = req.body.zguid || db.newGuid();
  var txt = req.body.txt || ''; 
  var tag = req.body.tag || '';
  var lat_lng = req.body.lat_lng || '';
  
  //var tpl = ejs.compile(fs.readFileSync(path.join(appdir, 'views_moblie/editpictrue.html'),'utf-8'));
    

    //如有地图则先写入地图信息
    if(lat_lng){
        var array = lat_lng.split(',');
        var lat = array[0];
        var lng = array[1];
        db.newLocation(1/*表示书法绘画*/,lat,lng,zguid,function(err,loc_guid){
             //写入库内
          var myloc_guid;
          if(!err) myloc_guid = loc_guid;
            
          db.exec('insert into shfimg(tag,txt,loc_guid,zguid,imgfile) values(?,?,?,?,?)',
                  [tag,txt,myloc_guid,zguid,img_guid],function(err){
              res.msgBox(err?'保存失败(有位置)':'保存成功(有位置)。',true);
              if(!err && img_guid){db.exec('update image img_style=2,img_content=? where img_guid=?',[zguid,img_guid]);}
          });
        }); 
      }
      else{
        //写入库内
        db.exec('insert into shfimg(tag,txt,zguid,imgfile) values(?,?,?,?)',[tag,txt,zguid,img_guid],function(err){
            //res.writeHead(200);
            res.msgBox(err?'保存失败':'保存成功。',true);
            if(!err && img_guid){db.exec('update image img_style=2,img_content=? where img_guid=?',[zguid,img_guid]);}
        });
      }
    
      //console.log(result); 
  
});

/*
 * 删除不必要的书法内容
 *
 */ 
router.get('/delimg/:zguid',function(req,res,next){
  var zguid =  req.params.zguid;
  //删除内容
  if(req.session.adminlogin && req.session.adminlogin==true){
    db.exec('delete from shfimg where zguid=?',[zguid],function(err){
    res.msgBox(err?'保存失败':'保存成功。',false);  
    });
  }
  else{
    res.msgBox('你是什么鬼？',false);
  };

}) 

module.exports = router;