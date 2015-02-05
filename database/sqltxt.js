//sql语句 ，用于以后的更新。
//
// 书写更新的sql语句
//
//

module.exports = {
  verstion : 6,
  sql:[
    {ver:1,txt:"CREATE TABLE shfimg(zguid CHAR(36) Primary Key," +
              "ct  datetime default (datetime('now','localtime'))," +
              "txt VARCHAR(250),imgfile VARCHAR(250) not null )"},
    
    {ver:2,txt:"ALTER TABLE shfimg ADD COLUMN tag VARCHAR(20);"},
    
    {ver:3,txt:"create table location(loc_guid char(36) primary key,"+
              "loc_style integer not null default 0, loc_content char(50), " +     
              "loc_latitude integer, loc_longitude integer,"+
              "loc_name varchar(250), loc_address varchar(250), " +
              "loc_scale integer, loc_infourl varchar(250))"},
    {ver:4,txt:"ALTER TABLE shfimg ADD COLUMN loc_guid char(36)"},
    {ver:5,txt:"create table sysvar(syva_id integer primary key,syva_update datetime);" + 
              "insert into  sysvar(syva_update) values(datetime('now','localtime'))"},
    {ver:6,txt:"create table motto(" + 
               "mot_id integer primary key autoincrement," +
               "mot_txt char(50) not null, " + 
               "mot_time datetime, " + 
               "mot_from varchar(200), " +
               "mot_stop bool default false)"}
    

  ]  
};



// module.exports 不同点就这样显示出来。
//exports.sqltxt = sqltxt

