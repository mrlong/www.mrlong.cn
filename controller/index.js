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
var EventProxy = require('eventproxy');


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
var get_indexhome = function (req, res,next) {	
  var ep = new EventProxy();
  
  ep.all(['books','shfs','fits','fithose','shfscount','bookcount','fitcount'],
    function(books,shfs,fits,fithose,shfscount,bookcount,fitcount){
    res.loadview( req.ismob==true ? 'web-index.html': 'index.html', 
    {'imgs':shfs,
     'books':books,
     'fits':fits,
     'fithose':fithose,
     'shfscount':shfscount,
     'bookcount':bookcount,
     'fitcount':fitcount
    },req.ismob);   
  });
  
  
  
  db.query('select  * from shfimg order by ct desc  limit 0,4',function(err1,rows,db){
    if(!err1){
      var data=[];
      for(var i=0; i<rows.length ; i++){
        data.push(rows[i].imgfile);
      };
      ep.emit('shfs',data);
    }
    else{
      ep.emit('shfs',[]);
    };

    db.all('select count(*) as c from shfimg',function(err,rows){
      ep.emit('shfscount',!err && rows.length>0?rows[0]['c']:0); 
    });

    db.all('select count(*) as c from books;',function(err,rows){
      ep.emit('bookcount',!err && rows.length>0?rows[0]['c']:0);
    });

    db.all('select count(*) as c from fit', function(err,rows){
      ep.emit('fitcount',!err && rows.length>0?rows[0]['c']:0);
    });
    
    
    db.all('select boo_isbn,boo_name from books order by boo_buytime desc limit 0,8',function(err2,rows2){  
      if(!err2){
        var books=[]; //书
        for(var i=0;i<rows2.length;i++){
          books.push({isbn:rows2[i].boo_isbn,title:rows2[i].boo_name});
        };
        ep.emit('books',books);
      }
      else {
        ep.emit('books',[]);
      }
    });
    
    //取出fit
    db.all('select fit_points,fit_targetPoints,fit_date from fit order by fit_date desc limit 0,4',function(err3,rows3){
      if(!err3){
        var fits = [];
        for(var i=0;i<rows3.length;i++){
          fits.push({fit_date:rows3[i].fit_date,fit_points:rows3[i].fit_points,fit_targetPoints:rows3[i].fit_targetPoints}); 
        };
        ep.emit('fits',fits);
      }
      else{
        ep.emit('fits',[]);
      }
    });

    //取出建身房记录

    db.all('select fih_longtime,fih_style,loc_guid,fih_createtime,fih_group_type1,fih_group_type2,fih_group_type3,fih_group_type4,fih_group_type5,fih_group_type6,fih_group_type7,fih_group_type8 from fithouse order by fih_createtime desc limit 0,2',function(err4,rows4){
      if(!err4){
        var fithose = [];
        for(var i=0;i<rows4.length;i++){
          var types=[];
          var str = '';
          types.push(rows4[i].fih_group_type1);
          types.push(rows4[i].fih_group_type2);
          types.push(rows4[i].fih_group_type3);
          types.push(rows4[i].fih_group_type4);
          types.push(rows4[i].fih_group_type5);
          types.push(rows4[i].fih_group_type6);
          types.push(rows4[i].fih_group_type7);
          types.push(rows4[i].fih_group_type8);
          if (types.indexOf(1)>=0) str += '胸';
          if (types.indexOf(2)>=0) str += '背';
          if (types.indexOf(3)>=0) str += '核心';
          if (types.indexOf(4)>=0) str += '大腿';
          if (types.indexOf(5)>=0) str += '跑步';
          fithose.push({
            fih_longtime:rows4[i].fih_longtime,
            fih_style:rows4[i].fih_style,
            loc_guid:rows4[i].loc_guid,
            fih_createtime:rows4[i].fih_createtime,
            fih_content:str
          }); 
        };
        ep.emit('fithose',fithose);
      }
      else{
        ep.emit('fithose',[]);
      }
    });

    
    
    //res.writeHead(200);
    //console.log(data);
    //var tpl = ejs.compile(fs.readFileSync(path.join(__dirname, 'views/index.html'),'utf-8'));
    //res.end(tpl({'imgs':data}));    
  });  
};


router.get('/',get_indexhome);
module.exports = router;
 