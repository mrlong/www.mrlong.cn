//////////////////////////////////////////
//
//
// 数据库处理单元
// 作者：龙仕云  2014-10-7
//
//
// 第三方组件：
//  sqlite3 https://github.com/mapbox/node-sqlite3
//
// 使用方法：
// 直接执行SQL语言
// 
// sql 为语言
// data 参数
// callback
//   err
//   results   //返回值
//
//////////////////////////////////////////

var fs = require("fs");
var path = require('path');
var config = require("./config.js");

var sqltxt = require('./database/sqltxt');  //升级的sql语句


//确定文件是否存在
var file = path.join(__dirname,config.sqlite.file);   //数据库文件 long.db,采用path将相对路径改为绝对路径
var exists = fs.existsSync(file);

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);




//升级库结构方法。
var do_upgrade =function(aver/*当前版本*/){
  //可能有版本号
  //按顺序执行sql语句功能。
  for (var i=aver;i<sqltxt.verstion;i++){
    // sqltxt.sql[i].ver==i+1 ,这时的i+1 = 11
    if (sqltxt.sql[i].ver-1==i){  
      db.exec(sqltxt.sql[i].txt,function(err){
        if(err){
          console.log('执行sql出错：'+sqltxt.sql[i].txt); 
        }
      });
      //console.log(sqltxt.sql[i].txt);
    }
  };
  
  //写入当前版本号
  db.run('update version set ver=?',[sqltxt.verstion],function(){
    db.close()
  });
  
};

db.serialize(function() {
  
  var curver = 0;
  if(!exists) {
    //文件库不存在时
    db.run("CREATE TABLE version (zid Integer Primary Key ,ver interger )");
    db.run("insert into version(ver) values(0)");
    do_upgrade(0);
  }
  else{
    //取出当前的版本号
    db.each("select * from version", function(err, row) {
      if (err) throw err;
      curver = row.ver;
      do_upgrade(curver);
    });
  };    
});



/*
 * 直接执行SQL语言,并有返回值的。
 * 
 * sql 为语言
 * data 参数
 * callback
 *   err
 *   results   //返回值
 *   db 
 *
 */
exports.query = function(sql,data,callback){
  var mycallback;
  var mydata;
  var db_query = new sqlite3.Database(file,sqlite3.OPEN_READWRITE);
  if (typeof data === 'function'){
    mycallback = data;
    mydata = [];
  }
  else{
    mycallback = callback;
    mydata = data;
  };
  
  db_query.all(sql,mydata,function(err,rows){
    if(err){
      if(mycallback){mycallback(err)} 
    }
    else{
      if(mycallback) mycallback(err,rows,db_query);
    }  
  }); 
  db_query.close();
};



/*
 * 直接执行SQL语言,最多支持三个sql并用;分开的情况,并无返回值的。
 * 
 * sql 为语言
 * data 参数
 * callback
 *   err
 *   db
 *
 */
exports.exec = function(sql,data,callback){
  var mycallback;
  var mydata;
  var db_exec = new sqlite3.Database(file,sqlite3.OPEN_READWRITE);
  if (typeof data === 'function'){
    mycallback = data;
    mydata = [];
  }
  else{
    mycallback = callback;
    mydata = data;
  };

  var sql_array = sql.split(";");
  db_exec.run(sql_array[0],data,function(err){  //1
    if(!err && sql_array.length>1 && sql_array[1]!=''){
      db_exec.run(sql_array[1],data,function(err){ //2
        if(!err && sql_array.length>2 && sql_array[2]!=''){
          db_exec.run(sql_array[2],data,function(err){if(mycallback){mycallback(err,db_exec)}}); //3
        }
        else{
          if(mycallback){mycallback(err,db_exec)}; 
        }
      });      
    }
    else{
      if(mycallback){mycallback(err,db_exec)};     
    }
  });
   
  
  db_exec.close(); 
};

//
// 生成GUID方法
//
exports.newGuid = function()
{
  var guid = "";
  for (var i = 1; i <= 32; i++){
    var n = Math.floor(Math.random()*16.0).toString(16);
    guid +=   n;
    if((i==8)||(i==12)||(i==16)||(i==20))
      guid += "-";
    }
  return guid;    
}

//
// 写入地图的信息
//  loc_style  = 1 书法绘画
//  contguid  书法绘画的guid
// 返回值：
//  err
//  zguid: 地图的guid
//  
exports.newLocation=function (style,lat,lng,contguid,fn){
  var myfn;
  var mycontguid;
  if (typeof contguid === 'function'){
    myfn = contguid;
    mycontguid = undefined;
  }
  else{
    myfn = fn;
    mycontguid = contguid;
  };
  
  var zguid = this.newGuid();
  if(mycontguid){
    this.exec('delete from location where loc_style=? and loc_content=?',[style,mycontguid],function(err,db){      
      db.run('insert into location(loc_guid,loc_style,loc_latitude,loc_longitude,loc_content)' +
        'values(?,?,?,?,?)',[zguid,style,lat,lng,mycontguid],function(err){
          if(myfn) myfn(err,zguid);
      }); 
    });
  }
  else{
    this.exec('insert into location(loc_guid,loc_style,loc_latitude,loc_longitude)' +
        'values(?,?,?,?)',[zguid,style,lat,lng],function(err){
          if(myfn) myfn(err,zguid);
      });     
  }
};

//module.exports=db;


