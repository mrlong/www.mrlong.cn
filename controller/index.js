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
  if (password == '7895123'){
    req.session.adminlogin = true; //表示管理员已登录
    res.json({success:true,msg:'登录成功。'});
  }
  else{
    res.json({success:false,msg:'登录失败'});
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
 
//取出地图信息
router.get('/location/:guid',function(req,res,next){
  var zguid = req.params.guid;
  db.query('select * from location where loc_guid=?',[zguid],function(err,rows){
    if(!err && rows.length>0){
      res.json({success:true,lat:rows[0].loc_latitude,lng:rows[0].loc_longitude});
    }
    else{
      res.json({success:false,msg:'在库内找不到地图信息'});
    }
  });
});


//起始页
router.get('/',function (req, res,next) {	
  var data=[];

  db.query('select  * from shfimg order by ct desc  limit 0,4',function(err,rows){
    if(!err){
      rows.forEach(function(row){data.push(row.imgfile)});
    };
    
    //res.writeHead(200);
    //console.log(data);
    //var tpl = ejs.compile(fs.readFileSync(path.join(__dirname, 'views/index.html'),'utf-8'));
    //res.end(tpl({'imgs':data}));
    res.render('./index', {'imgs':data});
  });
  
});


module.exports = router;
 