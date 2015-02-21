var config = require('./config');
var API = require('./wechat/api');

exports.wx=function(req,res,next){
  var api = new API(config.weixin.appid,config.weixin.appsecret);
  
  //weixin的认证信息
  var param = {
    debug:false,
    jsApiList: ['onMenuShareTimeline',
                'onMenuShareAppMessage',
                'openLocation',
                'getLocation'],
    url: 'http://' + config.domain + req.originalUrl
  };
  
  api.getJsConfig(param,function(err,result){
    if(!err){
      res.locals.wx = result; 
      next();
    }
    else{
      res.msgBox('获取wechat的认证出错,'+err,true);
    }
  });
};