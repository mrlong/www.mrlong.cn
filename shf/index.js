//var app = require('./mrlongapp');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var db = require('../db.js');
var util = require('../util.js');
var config = require('../config');
var API = require('../wechat/api');

var wechatapi = new API(config.weixin.appid,config.weixin.appsecret);

exports.pic = function(req,res,next){
  var appdir = res.locals.settings.appdir;
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
      var tpl = ejs.compile(fs.readFileSync(path.join(appdir, 'views/showpictrue.html'),'utf-8'));
      console.log(rows);
      res.end(tpl({'imgs':rows}));
    }
    else {
      //出错的情况
      util.errmsg('显示内容出错','/');
    }
  });
  
};


exports.pictrueone = function(req,res,next){
  var appdir = res.locals.settings.appdir;
  var picname = req.query.picname;
  var tpl = ejs.compile(fs.readFileSync(path.join(appdir, 'views/pictrueone.html'),'utf-8'));
  //console.log('ss'+res.locals.settings['picfilenames']);
  db.query('select * from shfimg order by ct desc',function(err,rows){
    if(!err){
      var files = [];
      rows.forEach(function(row){files.push(row.imgfile)});
      res.end(tpl({'picname':picname,'picfilenames':files}));    
    }
    else{
      util.errmsg('显示出错','/'); 
    }
  
  });
  
};

//修改书法信息
exports.editshinfo = function(req,res,next){
  var zguid = req.query.zguid||req.body.zguid;
  var appdir = res.locals.settings.appdir;
  
  var txt = req.body.txt || ''; 
  var tag = req.body.tag || '';
  var tpl = ejs.compile(fs.readFileSync(path.join(appdir, 'views/editpictrue.html'),'utf-8'));
  
  //weixin的认证信息
  wechatconfig={};
  wechatconfig.appid = config.weixin.appid;
  wechatconfig.debug = true;
  wechatconfig.timestamp = new Date().getTime();
  wechatconfig.nonceStr  = util.randomString(16);
  wechatconfig.signature = '11222';
  
  var param = {
    debug:false,
    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'],
    url: config.domain
  };
  
  api.getJsConfig(param,function(err,result){
    if(!err){
      if(txt || tag){
        //写入库内
        db.exec('update shfimg set tag=?,txt=? where zguid=?',[tag,txt,zguid],function(err){
          res.writeHead(200);
          res.end(tpl({'zguid':zguid,'msg': err?'保存失败':'保存成功。',wechatconfig:result}));
        });
      }
      else{
        res.end(tpl({'zguid':zguid,'msg':'',wechatconfig:result}));  
      } 
      //console.log(result); 
    }
    else{
      util.errmsg(err,'/');
     }
  });    
};