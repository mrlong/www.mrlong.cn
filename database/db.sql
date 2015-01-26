/*
/*  数据加采用sqlite
/*
*/



/*书法索引*/

CREATE TABLE shfimg(
  zguid CHAR(36) Primary Key,   /*guid*/
  ct  datetime default (datetime('now', 'localtime'))        /*创建时间*/
  txt VARCHAR(250),                /*说明*/
  imgfile VARCHAR(250) not null    /*文件名，文件固定存放在./public/shf目录之内*/
  
);

