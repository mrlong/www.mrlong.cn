//微信内容
var wechat = require('wechat');
var text = require('./text');
var image = require('./image');
var location = require('./location');
var voice = require('./voice');
var video = require('./video');
var event = require('./event');
var link = require('./link');
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

api.createMenu(require('./menuconfig'),function(e){
  
});


exports.mywechat = mywechat;