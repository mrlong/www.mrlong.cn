//微信内容
var wechat = require('wechat');
var text = require('./text');
var image = require('./image');
var location = require('./location');
var voice = require('./voice');
var video = require('./video');
var event = require('./event');
var link = require('./link');
var config = require('../config');

//appsecret
//var api = new API(config.weixin.appid, 'eace164dedd242dfc74b9a79b9bbd0c7');

/*
var mywechat = wechat(config.weixin.token, 
  wechat.text(text)      //文本
    .image(image)        //图片
    .location(location)  //位置
    .voice(voice)        //声音
    .video(video)        //视频
    .link(link)      
    .event(event));      //事件

//api.createMenu(require('./menuconfig'),function(e){
  
//});


exports.mywechat = mywechat;
*/


module.exports = function(req,res,next){
  var message = req.weixin;
  //'text', 'image', 'voice', 'video', 'location', 'link', 'event'
  console.log(JSON.stringify(message));
  if (message.MsgType=='text') {text(message,req,res,next)};
  if (message.MsgType=='event'){event(message,req,res,next)};
  if (message.MsgType=='image'){image(message,req,res,next)};
  if (message.MsgType=='voice'){voice(message,req,res,next)};
  if (message.MsgType=='video'){video(message,req,res,next)};
  if (message.MsgType=='location'){location(message,req,res,next)};
  if (message.MsgType=='link'){link(message,req,res,next)};
  
};