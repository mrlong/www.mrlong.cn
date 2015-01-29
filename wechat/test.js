/*用于测试的单元
  作者：龙仕云
  
*/


var config = require('../config');
var API = require('./api');

var api = new API(config.weixin.appid,config.weixin.appsecret);

var param = {
  debug:false,
  jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'],
  url: 'http://www.mrlong.cn'
 };

var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort();
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  return string.substr(1);
};

api.getJsConfig(param,function(err,result){
  if(!err){
    console.log(result); 
    var string = raw(result);
    console.log(string);
  }
  else{
    console.log('出错了'+err);
  }
});


 