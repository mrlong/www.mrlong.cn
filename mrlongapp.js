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
var cookieParser = require('cookie-parser');
var session = require('express-session');

var config = require('./config');
var shf = require('./shf');
var test = require('./test');
var db = require('./db');

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
  cookie: { secure: false,maxAge: 1000 * 60 * 60 * 24 * 7 }  //7天保存
}));


//app.use(connect.query());
//app.use(connect.favicon());
//app.use(connect.logger());
//app.use(connect.static(__dirname + '/public', { maxAge: 86400000 }));

app.use(function(req,res,next){
  res.locals.appdir  = __dirname;
  //取出更新的日期,这地方有性能问题。
  db.query('select syva_update from sysvar',function(err,rows){
    if(!err && rows.length>0){
        res.locals.syva_update = rows[0].syva_update;
    }
    else{
      res.locals.syva_update= '无法读出';
    };
  });
  
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

//书法
app.use('/pic',shf.pic);
app.use('/pictrueone',shf.pictrueone);
app.use('/test_index',test.index);
app.use('/editshfinfo',shf.editshinfo);

//取出地图信息
app.get('/location/:guid',function(req,res,next){
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
app.get('/',function (req, res,next) {	
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


app.listen(3002);
console.log('mrlong.cn stated on port 3002');