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
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var config = require('./config');

var test = require('./test');
var db = require('./db');

//控制器
var shf = require('./controller/shf');
var motto = require('./controller/motto'); 
var index = require('./controller/index');
var books = require('./controller/books');


var app = express();
module.exports = app;

//参数
app.set('appdir',__dirname);
app.use(bodyParser());
app.use(express.static(__dirname + '/public',{ maxAge: 86400000 }));
app.use(express.static(__dirname + '/uploads'));


app.set('views', path.join(__dirname, 'views_pc'));
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.set('view cache', false);

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
  res.locals.appdir  = __dirname;
  res.locals.adminlogin = req.session.adminlogin;  //是否管理员账号登录过
  next();
});

//上但有post方法说明是有更新，记下更新的日期。（有性能问题）
app.post('*',function(req,res,next){
  db.exec("update sysvar set syva_update=datetime(CURRENT_TIMESTAMP,'localtime')");
  next();
});

//微信
app.use('/wechat', require('./wechat').mywechat);

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


app.use('/test_index',test.index);

app.listen(3002);
console.log('mrlong.cn stated on port 3002');