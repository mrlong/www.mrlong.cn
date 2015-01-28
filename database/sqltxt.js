//sql语句 ，用于以后的更新。
//
// 书写更新的sql语句
//
//

module.exports = {
  verstion : 4,
  sql:[
    {ver:1,txt:"CREATE TABLE shfimg(zguid CHAR(36) Primary Key," +
              "ct  datetime default (datetime('now','localtime'))," +
              "txt VARCHAR(250),imgfile VARCHAR(250) not null )"},
    
    {ver:2,txt:"ALTER TABLE shfimg ADD COLUMN tag VARCHAR(20);"},
    
    {ver:3,txt:"create table location(zguid char(36) primary key,"+
              "zstyle integer not null default 0, zcontent char(50), " +     
              "zlatitude integer, zlongitude integer,"+
              "zname varchar(250), zaddress varchar(250), " +
              "zscale integer, zinfourl varchar(250))"},
    {ver:4,txt:"ALTER TABLE shfimg ADD COLUMN loc_guid char(36);"}
  ]  
};

// module.exports 不同点就这样显示出来。
//exports.sqltxt = sqltxt