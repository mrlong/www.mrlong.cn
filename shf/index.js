//var app = require('./mrlongapp');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

exports.pic = function(req,res,next){
  var appdir = res.locals.settings.appdir;
  
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
};


exports.pictrueone = function(req,res,next){
  var appdir = res.locals.settings.appdir;
  var picname = req.query.picname;
  var tpl = ejs.compile(fs.readFileSync(path.join(appdir, 'views/pictrueone.html'),'utf-8'));
  //console.log('ss'+res.locals.settings['picfilenames']);
  res.end(tpl({'picname':picname,'picfilenames':res.locals.settings['picfilenames']}));
};