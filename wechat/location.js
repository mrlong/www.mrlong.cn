//
// 处理地理位置
//

var db = require('../db');
var config = require('../config');

module.exports = function(location, req, res, next){
  console.log(location);
  
  //下入库内
  var loc_guid = db.newGuid();
  db.exec('insert into location(loc_guid,loc_latitude,loc_longitude,loc_scale,loc_address) values(?,?,?,?,?)',
          [loc_guid,location.Location_X,location.Location_Y,location.Scale,location.Label],function(err){
    if(!err){
      var content = '';

      //content.push({
      //  title:'选择你要做什么?',
      //  url:''});
  
  
      //content.push({
      //  title: '1、我的足迹',
      //  url: config.domain + '/footer/add?loc_guid=' + loc_guid
      //});

      content = content + '\n\r' + '1、我的足迹 ' + config.domain + '/footer/add?loc_guid=' + loc_guid; 
      content = content + '\n\r' + '2、上传错了,我要删除掉 ' + config.domain + '/location/del/' + loc_guid; 
  
      res.reply(content);
    }
    else{
      res.reply('保存地理位置信息出错');    
    }
    
  })
  
  
};


///*地点位置信息列表 ver=3*/
//create table location(
//  loc_guid char(36) primary key,            /*这个是主键*/
//  loc_style integer not null default 0,     /*0=表示没有关联上的， 内容类型 1=书法的拍照位置 2=读书笔记位置*/
//  loc_content char(50),                     /*关联内容的信息，如是书法，则这个是书法的zguid*/
//  loc_latitude integer,                     /* 纬度，浮点数，范围为90 ~ -90*/
//  loc_longitude integer,                    /* 经度，浮点数，范围为180 ~ -180。*/
//  loc_name varchar(250),                    /* 位置名*/
//  loc_address varchar(250),                 /* 地址的祥情说明*/
//  loc_scale integer,                        /* 地图缩放级别,整形值,范围从1~28。默认为最大 */
//  loc_infourl varchar(250),                 /* 在查看位置界面底部显示的超链接,可点击跳转 */
//  loc_precision integer                     /* 位置精度 ver=7*/
//);