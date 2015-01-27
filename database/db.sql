/*
/*  数据加采用sqlite
/*
*/



/*书法索引*/

CREATE TABLE shfimg(
  zguid CHAR(36) Primary Key,   /*guid*/
  ct  datetime default (datetime('now','localtime')),        /*创建时间*/
  txt VARCHAR(250),                 /*说明*/
  imgfile VARCHAR(250) not null,    /*文件名，文件固定存放在./public/shf目录之内*/
  tag VARCHAR(20)                   /*标签 var=2*/
  
);

/*系统参数 ver=3*/
/*
create table sysparams(
  zguid char(36) primary key,
  zid integer not null ,       /*ID值*/
  zname varchar(20),           /*名称*/ 
  zvalue varchar(20),          /*值*/
  zstyle int not null          /*类型 1=书法标签*/  
);
*/
