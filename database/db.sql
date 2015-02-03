/*
/*  数据加采用sqlite
/*
*/

/*
 *  版本信息：
 *    ver=6
 *
 */


/*书法索引*/

CREATE TABLE shfimg(
  zguid CHAR(36) Primary Key,   /*guid*/
  ct  datetime default (datetime('now','localtime')),        /*创建时间*/
  txt VARCHAR(250),                 /*说明*/
  imgfile VARCHAR(250) not null,    /*文件名，文件固定存放在./public/shf目录之内*/
  tag VARCHAR(20),                  /*标签 var=2*/
  loc_guid char(36)                 /* var=4 地图信息内容，如有说明在什么位置拍照*/
  
);

/*系统参数 */
/*
create table sysparams(
  zguid char(36) primary key,
  zid integer not null ,       /*ID值*/
  zname varchar(20),           /*名称*/ 
  zvalue varchar(20),          /*值*/
  zstyle int not null          /*类型 1=书法标签*/  
);
*/

/*地点位置信息列表 ver=3*/
create table location(
  loc_guid char(36) primary key,            /*这个是主键*/
  loc_style integer not null default 0,     /*0=表示没有关联上的， 内容类型 1=书法的拍照位置*/
  loc_content char(50),                     /*关联内容的信息，如是书法，则这个是书法的zguid*/
  loc_latitude integer,                     /* 纬度，浮点数，范围为90 ~ -90*/
  loc_longitude integer,                    /* 经度，浮点数，范围为180 ~ -180。*/
  loc_name varchar(250),                    /* 位置名*/
  loc_address varchar(250),                 /* 地址的祥情说明*/
  loc_scale integer,                        /* 地图缩放级别,整形值,范围从1~28。默认为最大 */
  loc_infourl varchar(250)                  /* 在查看位置界面底部显示的超链接,可点击跳转 */
);


/*系统变量 var=5,6*/
create table sysvar(
  syva_id integer primary key,
  syva_update datetime                      /*更新时间网站*/
);

