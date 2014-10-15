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


//微信内容
var wechat = require('wechat');
var text = require('./wechat/text');
var image = require('./wechat/image');
var location = require('./wechat/location');
var voice = require('./wechat/voice');
var video = require('./wechat/video');
var event = require('./wechat/event');
var link = require('./wechat/link');
var API = require('wechat').API;
var api = new API('wx4e1abb249fe9b751', 'eace164dedd242dfc74b9a79b9bbd0c7');


var mywechat = wechat('mrlongwechat', 
  wechat.text(text)      //文本
    .image(image)        //图片
    .location(location)  //位置
    .voice(voice)        //声音
    .video(video)        //视频
    .link(link)      
    .event(event));      //事件

api.createMenu(require('./wechat/menuconfig'),function(e){
  
});

var app = express();
app.settings = {};

app.use(bodyParser());
app.use(express.static(__dirname + '/public',{ maxAge: 86400000 }));
app.use(express.static(__dirname + '/uploads'));
app.engine('html', require('ejs').renderFile);

//app.use(connect.query());
//app.use(connect.favicon());
//app.use(connect.logger());
//app.use(connect.static(__dirname + '/public', { maxAge: 86400000 }));
app.use('/wechat', mywechat);

// app.use(function(req,res,next){
// 	var name = req.query.name;
// 	res.end('hello' + name);
// });

app.use('/pic',function (req, res,next) {  
  //var filenames = fs.readdirSync(__dirname + '/public/shf');
  //对文件进行排序
  fs.readdir(__dirname + '/public/shf', function(err, filenames){
    filenames.sort(function(val1, val2){
      //读取文件信息
      var stat1 = fs.statSync(__dirname + '/public/shf/' + val1);
      var stat2 = fs.statSync(__dirname + '/public/shf/' + val2);
      //根据时间从最新到最旧排序
      return stat2.mtime - stat1.mtime;
    });
    
    
    app.settings['picfilenames'] = filenames;
    res.writeHead(200);
    //console.log(data);
    var tpl = ejs.compile(fs.readFileSync(path.join(__dirname, 'views/showpictrue.html'),'utf-8'));
    res.end(tpl({'imgs':filenames}));     
  });
});

app.use('/pictrueone',function(req,res,next){
  var picname = req.query.picname;
  var tpl = ejs.compile(fs.readFileSync(path.join(__dirname, 'views/pictrueone.html'),'utf-8'));
  res.end(tpl({'picname':picname,'picfilenames':app.settings['picfilenames']}));
});

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