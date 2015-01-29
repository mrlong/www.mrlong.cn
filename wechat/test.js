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
api.getJsConfig(param,function(err,result){
  if(!err){
    console.log(result); 
  }
  else{
    console.log('出错了'+err);
  }
});


 