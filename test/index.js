/*
   测试页面，用于测试之用。
   作者:龙仕云

*/
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');


/*测试浏览器*/
exports.index = function(req,res,next){
  var appdir = res.locals.settings.appdir;
  var tpl = ejs.compile(fs.readFileSync(path.join(appdir, 'test/index.html'),'utf-8'));
  res.end(tpl({}));
};