///////////////////////////////////////////////////////////////////////////////
//
//  龙仕云的主页。
// 
//  为生活积累点点滴滴 － 20140-10-15
//
//
//
//////////////////////////////////////////////////////////////////////////////

var fs = require('fs');
var ejs = require('ejs');
var wechat = require('wechat');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var multer  = require('multer');  //上传组件
var https = require('https');
//var http = require('http');

var config = require('./config');

var test = require('./test');
var db = require('./db');
var Util = require('./util');

//控制器
var shf = require('./controller/shf');
var motto = require('./controller/motto'); 
var index = require('./controller/index');
var books = require('./controller/books');
var footer = require('./controller/footer');
var friend = require('./controller/friend');
var blog = require('./controller/blog');
var images = require('./controller/images'); //图片服务
var remind = require('./controller/remind');
var fit = require('./controller/fit');

var app = express();

module.exports = app;

//参数
app.set('appdir',__dirname);
app.response.loadview=function(filename,params,ismoble){
  var myismoble;
  var myparams = {};
  if(typeof params ==='boolean'){
      myismoble = params;
  }
  else{
    myparams = params;
    myismoble = ismoble || false; 
  };

  if (myismoble == false){
    this.render('./views_pc/' + filename,myparams); 
  }
  else{
    this.render('./views_moblie/' + filename,myparams);   
  }
};

app.response.msgBox=function(msg,url,ismoble){
  var myurl,myismoble;
  if (typeof url === 'boolean'){
    myismoble = url;
    myurl = null;
  }
  else{
    myurl = url;
    myismoble = ismoble || false;
  };

  if (myismoble == false){
     this.render('./views_pc/error.html',{
        content:msg,
        url:myurl,
        title:config.title
      });
  }
  else{
    this.render('./views_moblie/msgbox.html',{
        content:msg,
        url:myurl,
        title:config.title
      });  
  }
};


app.use(bodyParser());
app.use(express.static(__dirname + '/public',{ maxAge: 86400000 }));
app.use(express.static(__dirname + '/uploads'));

app.use(multer({
  dest: './database/images',
  rename: function (fieldname, filename) {
    return db.newGuid();
  }
}));



app.set('views', path.join(__dirname, './'));
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.set('view cache', config.viewcache||false);

app.use(cookieParser());
app.use(session({
  name:'mrlongapp',
  secret: '7895123', 
  key: 'mrlongapp', 
  cookie: { secure: false,maxAge: 1000 * 60 * 60 * 24 * 1 }  //1天保存
}));


//app.use(connect.query());
//app.use(connect.favicon());
//app.use(connect.logger());
//app.use(connect.static(__dirname + '/public', { maxAge: 86400000 }));

app.use(function(req,res,next){
  var isMob = Util.isMobileBrowser(req);
  res.locals.appdir  = __dirname;
  req.ismob = isMob; //是否是移动浏览器
  res.locals.ismob = isMob;
  res.locals.adminlogin = req.session.adminlogin;  //是否管理员账号登录过
  next();
});

//上但有post方法说明是有更新，记下更新的日期。（有性能问题）
app.post('*',function(req,res,next){
  db.exec("update sysvar set syva_update=datetime(CURRENT_TIMESTAMP,'localtime')");
  next();
});

//微信
app.use('/wechat', wechat(config.weixin.token, function (req, res, next){
  var message = req.weixin;
  //只有自己才能发信息
  if(message.FromUserName=='o5Lr2t1c6b0JV0xidlxbClJa56s4' && 
     message.ToUserName=='gh_8be223f635d1'){
    next();
  }
  else{
    res.reply('这个是个人应用你不能关注，请退出。');
  }   
}),require('./wechat'));


// app.use(function(req,res,next){
// 	var name = req.query.name;
// 	res.end('hello' + name);
// });



//主页
app.use('/',index);
//书法
app.use('/shf',shf);
//格言
app.use('/motto', motto);
//读书
app.use('/books',books);
//我的足迹
app.use('/footer',footer);
//我的人脉
app.use('/friend',friend);
//提醒
app.use('/remind',remind);
//我的博客
app.use('/blog',blog);
//图片
app.use('/images',images);
//misfit智能设备
app.use('/fit',fit);

app.use('/test_index',test.index);

//将文件MP_verify_rp3cMI3C939NYLBq.txt（点击下载）
//上传至填写域名或路径指向的web服务器（或虚拟主机）的目录（若填写域名，
//将文件放置在域名根目录下，例如wx.qq.com/MP_verify_rp3cMI3C939NYLBq.txt；
//若填写路径，将文件放置在路径目录下，例如wx.qq.com/mp/MP_verify_rp3cMI3C939NYLBq.txt），并确保可以访问。
app.use('/MP_verify_QMSKM1ncN5jPMkAX.txt',function(req,res,next){
  var file = fs.readFileSync(__dirname+'/public/MP_verify_QMSKM1ncN5jPMkAX.txt');
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(file);  
});

//定时器
require('./time').do();



//证书处理
if(config.cert){
  var privateKey = fs.readFileSync(config.cert.key);
  var certificate = fs.readFileSync(config.cert.crt);
  var credentials = {key: privateKey, cert: certificate};
  var httpsServer = https.createServer(credentials, app);
  httpsServer.listen(3002);
  console.log('mrlong.cn stated on port 3002 by ssl');
}
else{
  app.listen(3002);
  console.log('mrlong.cn stated on port 3002');
};

