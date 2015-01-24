///////////////////////////////////////////////////////////////////////////////
//
//  龙仕云的主页。
// 
//  为生活积累点点滴滴 － 20140=1015
//
//
//
//////////////////////////////////////////////////////////////////////////////

var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var shf = require('./shf');
var test = require('./test');

var app = express();
module.exports = app;

//参数
app.settings = {};
app.settings.config = config;
app.settings.appdir = __dirname;

app.use(bodyParser());
app.use(express.static(__dirname + '/public',{ maxAge: 86400000 }));
app.use(express.static(__dirname + '/uploads'));
app.engine('html', require('ejs').renderFile);

//app.use(connect.query());
//app.use(connect.favicon());
//app.use(connect.logger());
//app.use(connect.static(__dirname + '/public', { maxAge: 86400000 }));

app.use(function(req,res,next){
	res.locals.settings = app.settings;
	next();
});


//微信
app.use('/wechat', require('./wechat').mywechat);

// app.use(function(req,res,next){
// 	var name = req.query.name;
// 	res.end('hello' + name);
// });

//书法
app.use('/pic',shf.pic);
app.use('/pictrueone',shf.pictrueone);
app.use('/test_index',test.index);

//起始页
app.use('/',function (req, res,next) {	
  var data=[];
  //var filenames = fs.readdirSync(__dirname + '/public/shf');
  //对文件进行排序
  //如目录不存在参会出错 2014-7-26 by mrlong
  fs.readdir(__dirname + '/public/shf', function(err, filenames){
    filenames.sort(function(val1, val2){
      //读取文件信息
      var stat1 = fs.statSync(__dirname + '/public/shf/' + val1);
      var stat2 = fs.statSync(__dirname + '/public/shf/' + val2);
      //根据时间从最新到最旧排序
      return stat2.mtime - stat1.mtime;
    });

    for (i = 0; i < filenames.length; i++) {  
      if((filenames[i].indexOf('.jpg')>0) || (filenames[i].indexOf('.JPG')>0) ||
         (filenames[i].indexOf('.png')>0) || (filenames[i].indexOf('.PNG')>0) ) {
    	   data.push(filenames[i]);
    	   if(data.length>5){break;};
      };
	  };  
    res.writeHead(200);
    //console.log(data);
    var tpl = ejs.compile(fs.readFileSync(path.join(__dirname, 'views/index.html'),'utf-8'));
    res.end(tpl({'imgs':data}));  	 
  });
});


app.listen(3002);
console.log('mrlong.cn stated on port 3002');