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
var config = require("./config.js");
var file = config.sqlite.file;  //数据库文件 long.db

//确定文件是否存在
var exists = fs.existsSync(file);

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

//sql语句 ，用于以后的更新。
var sqltxt = {
  verstion : 2,
  sql:[
    {ver:1,txt:"CREATE TABLE info (data TEXT)"},
    {ver:2,txt:'CREATE TABLE qzimg (img blob)'}
  ]  
};


//升级库结构方法。
var do_upgrade =function(aver/*当前版本*/){
  //可能有版本号
  //按顺序执行sql语句功能。
  for (var i=aver;i<sqltxt.verstion;i++){
    if (sqltxt.sql[i].ver==i+1){  
      db.run(sqltxt.sql[i].txt);
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
    db.run("CREATE TABLE version (ver TEXT)");
    db.run("insert into version(ver) values(0)");
    do_upgrade(0);
  }
  else{
    //取出当前的版本号
    db.each("select * from version", function(err, row) {
      if (err) throw err;
      curver = row.ver;
      //console.log('curver='+curver);
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
  
  db_query.each(sql,mydata,function(err,rows){
    if(err){
      if(mycallback){mycallback(err)} 
    }
    else{
      if(mycallback) mycallback(err,rows);
    }  
  }); 
  db_query.close();
};



/*
 * 直接执行SQL语言,并无返回值的。
 * 
 * sql 为语言
 * data 参数
 * callback
 *   err
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
  
  db_exec.run(sql,mydata,function(errs){
      if(mycallback){mycallback(err)} 
  }); 
  db_exec.close(); 
};


//module.exports=db;


