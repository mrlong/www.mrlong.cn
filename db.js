//////////////////////////////////////////
//
//
// 数据库处理单元
// 作者：龙仕云  2014-10-7
//
// 第三方组件：
//  sqlite3 https://github.com/mapbox/node-sqlite3
//
//////////////////////////////////////////

var fs = require("fs");
var config = require("./config.js");
var file = config.sqlite.file;

//确定文件是否存在
var exists = fs.existsSync(file);

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

var sqltxt = {
  verstion : 1,
  sql:[];

}

db.serialize(function() {
  if(!exists) {
    //文件库不存在时
    db.run("CREATE TABLE Stuff (thing TEXT)");
  }
  else{
    //可能有版本号
    
  }
  
});
