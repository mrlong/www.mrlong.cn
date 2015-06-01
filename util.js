/*
 *  公共方法集合。
 *  作者：龙仕云 2014-5-17 
 *
 *
 *
 */


var config=require('./config');
var fs=require('fs');
var crypto = require('crypto');
var nodemailer = require("nodemailer");  //发邮件

//生成随机码
// size 长度，如不写是6
//
exports.randomString=function(size) {
  size = size || 6;
  var code_string = 'ABCDEFGHIJKL3MN2PQRST1U9VWX8YZ7ab6cde5fghi4jklm0npqrstuvwxyz';
  var max_num = code_string.length + 1;
  var new_pass = '';
  while (size > 0) {
    new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
    size--;
  }
  return new_pass;
};

//
// 提示窗口
// @param {string} msg 提示内容
// @param {url} url 自动转向到
// 返回提示的字符串内容
//
exports.msgBox=function(msg,url){
  var ejs = require('ejs')
      ,str = fs.readFileSync( + './views_pc/error.html', 'utf8');
  var ret = ejs.render(str,{
        content:msg,
        url:url,
        title:config.title
      });
  return ret;
};

//
// 提示错误窗口
// @param {string} msg 提示内容
// @param {url} url 自动转向到
// 返回提示的字符串内容
//
exports.errBox=function(msg,url){
  var ejs = require('ejs')
      ,str = fs.readFileSync('./views_pc/error.html', 'utf8');
  var ret = ejs.render(str,{
        content:msg,
        url:url,
        title:config.title
      });
  return ret;
};

//字符串加密
exports.encrypt=function(str, secret) {
  var cipher = crypto.createCipher('aes192', secret);
  var enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}

//字符串解密
exports.decrypt=function(str, secret) {
  var decipher = crypto.createDecipher('aes192', secret);
  var dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

//
// md5
// @param {string} str 
// 返回提示的字符串内容
//
exports.md5=function (str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
}

//
// 获取文件的扩展名
//
exports.getFileExt = function(file){ 
  var d=/\.[^\.]+$/.exec(file); 
  return d[0]; 
};

//
// 当前文件随意生成一个同扩展名的文件
//
exports.getSameFile=function(file){
  var ext = exports.getFileExt(file);
  var name = file.substring(0,file.length-ext.length);
  return name + exports.randomString(6) + ext;
}


//
// 获取上级的路径：
//  如：  /wechat/users/xxxxxxx/reaload 返回 /wechat/users/xxxxxxxxx
//   

exports.getParentPath=function (path){
  var data = path.split('/');
  var ppath = '';
  for (var i=0; i < data.length-1; i++)
  { 
      if(ppath===''){
        ppath = data[i];
      }
      else{
        ppath = ppath + '/' + data[i];
      }
  };
  return ppath;
};

//
//发邮件
//fn(err)
//opt:{
//      from : "11111111@qq.com",
//      to : "22222222@qq.com",
//      subject: "邮件主题",
//      generateTextFromHTML : true,
//      html : "<p>这是封测试邮件</p>"  \\text:
// }
exports.sendmail=function(opt,fn){
  var transport = nodemailer.createTransport(config.smtp);
  transport.sendMail(opt, function(err, response){
    if(fn)fn(err); //response.message
    transport.close();
  });
};


//
// 确定是否是移动浏览器
//
exports.isMobileBrowser=function(req){
   var u = req.headers['user-agent']||''; 
   var data = {//移动终端浏览器版本信息 
        trident: u.indexOf('Trident') > -1, //IE内核
        presto: u.indexOf('Presto') > -1, //opera内核
        webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
        gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
        mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
        android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
        iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
        iPad: u.indexOf('iPad') > -1, //是否iPad
        webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
    };
  
  return data.mobile || data.ios || data.android || data.iPhone;
};

