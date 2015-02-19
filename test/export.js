/*
 *
 * 将书法的库移到image库内
 * 
 */


var db = require('../db');

db.query('select * from shfimg',function(err,rows,db){
  console.log(rows);
  rows.forEach(function(row){
    var myguid = row.zguid; 
    db.run('insert into image(img_guid,img_filename,img_style,img_content,img_time) values(?,?,?,?,?)',
           [myguid,row.imgfile,2,myguid,row.ct],function(err){ 
      
      if(!err){
        db.run('update shfimg set imgfile=? where zguid=?',[myguid,myguid],function(err){
          if(err) console.log(err);
        });
      } 
      else{
        console.log(err)
      }
    });
  });


});


///*图片资源表 
//create table image(
//  img_guid char(36) primary key,         /*, 保存在图定的位置，暂定在database/images 下面,与guid进行命名*/
//  img_filename varchar(100),             /*文件的原名称*/
//  img_style integer not null default 0,  /*类型 1=我的足迹的图片*/
//  img_content char(50),                  /*关联内容的信息，如是我的足迹，则这个是我的足迹的guid*/
//  img_time default (datetime('now','localtime')) 
//);
//
//CREATE TABLE shfimg(
//  zguid CHAR(36) Primary Key,   /*guid*/
//  ct  datetime default (datetime('now','localtime')),        /*创建时间*/
//  txt VARCHAR(250),                 /*说明*/
//  imgfile VARCHAR(250) not null,    /*文件名，文件固定存放在./public/shf目录之内,从2015-2-19改为采用统一的image库存放，这个值就是image的guid*/
//  tag VARCHAR(20),                  /*标签 var=2*/
//  loc_guid char(36)                 /* var=4 地图信息内容，如有说明在什么位置拍照*/
//  
//);