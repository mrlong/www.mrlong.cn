/*
 *
 *  作者：龙仕云  2015-2-7
 *
 *
 *
 */


var express = require('express');
var db = require('../db');
var API = require('../wechat/api');
var config = require('../config');
var fs = require('fs');
var path = require('path');
var router = express.Router();


//获取二维码
router.get('/getqrcode',function(req,res,next){
  var api = new API(config.weixin.appid,config.weixin.appsecret);
  var this_res = res;
  api.createTmpQRCode(2000,1800,function(err, data, res){
    if(!err){
      this_res.json(data);
    }
    else{
      this_res.json({success:false,msg:'获取二维码申请号出错'+err})
    }
    
  });
});

//
//登录
// 参数：
//   password
//
router.post('/login',function(req,res,next){
  var password = req.body.password;
  
  db.query('select syva_adminpw from sysvar',function(err,rows){
    if(!err){
      var pw = rows[0].syva_adminpw;
      if (password === pw){
        req.session.adminlogin = true; //表示管理员已登录
        res.json({success:true,msg:'登录成功。'});
      }
      else{
        res.json({success:false,msg:'密码错误，登录失败'});
      } 
    }
    else{
      res.json({success:false,msg:'登录失败'});  
    };
  });
});

//
// 退出
//
router.post('/logout',function(req,res,next){
  if(req.session.adminlogin){
    req.session.destroy();
    res.json({success:true,msg:'注销登录成功'});
  } 
  else{
    res.json({success:false,msg:'注销失败'});
  }
});


//
// 取出系统的参数
//
router.get('/getsysvar/:name',function(req,res,next){
  var myname = req.params.name;
  switch(myname){
    case 'syva_update':
      db.query('select syva_update from sysvar',function(err,rows){
        if(!err && rows.length>0){
          res.json({success:true,txt:rows[0].syva_update})
        }
        else{
          res.json({success:false,txt:''});
        };
      });
      break;
    case '...':
      break;
  };
});
 

//删除地图
router.get('/location/del/:guid',function(req,res,next){
  var zguid = req.params.guid;
  db.exec('delete from location where loc_guid=? and loc_style=0',[zguid],function(err){
     res.msgBox(!err?'删除成功':'删除失败'+err,true);   
  });

});

//取出地图信息
router.get('/location/:guid',function(req,res,next){
  var zguid = req.params.guid;
  db.query('select * from location where loc_guid=?',[zguid],function(err,rows){
    if(!err && rows.length>0){
      res.json({success:true,
                lat:rows[0].loc_latitude,
                lng:rows[0].loc_longitude,
                scale:rows[0].loc_scale,
                address:rows[0].loc_address});
    }
    else{
      res.json({success:false,msg:'在库内找不到地图信息'});
    }
  });
});



//视频的处理
router.get('/videos/del/:guid',function(req,res,next){
  var vid_guid = req.params.guid;
  db.query('select * from video where vid_guid=? and vid_style=0',[vid_guid],function(err,rows,db){
    if(!err && rows.length>0){
      var filename = path.join(appdir,config.sqlite.videos) + '/' + rows[0].vid_filename;
      var filename_thmeb = path.join(appdir,config.sqlite.videos) + '/' + rows[0].vid_filenmae_thumb;
      
      db.run('delete from video where vid_guid=?',[vid_guid],function(err){
        if(!err){
          //删除本地文件
          fs.unlink(filename,function(err){
            if(!err){
              fs.unlink(filename_thmeb,function(err){
                res.msgBox(!err?'删除本地视频文件成功':'删除本地失败'+err,true);
              });
            }
            else{
              res.msgBox('删除本地视频失败'+err,true);    
            }
          });
        }
        else{
          res.msgBox('无法删除掉的视频'+err,true);   
        }
      });
    }
    else{
      res.msgBox('找不到要删除的视频'+err,true); 
    }
  });
});



//起始页
router.get('/',function (req, res,next) {	
  var data=[];
  var books=[]; //书
  db.query('select  * from shfimg order by ct desc  limit 0,4',function(err1,rows,db){
    db.all('select boo_isbn,boo_name  from books order by boo_buytime desc limit 0,8',function(err2,rows2){
      
      if(!err1){
        rows.forEach(function(row){data.push(row.imgfile)});
      };
      
      if(!err2){
        rows2.forEach(function(book){books.push({isbn:book.boo_isbn,title:book.boo_name})}); 
      };
      
     res.render('./views_pc/index', {'imgs':data,'books':books}); 
      
    });    
    //res.writeHead(200);
    //console.log(data);
    //var tpl = ejs.compile(fs.readFileSync(path.join(__dirname, 'views/index.html'),'utf-8'));
    //res.end(tpl({'imgs':data}));    
  });
  
});


module.exports = router;
 