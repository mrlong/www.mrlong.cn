/*
/*  数据加采用sqlite
/*
*/

/*
 *  版本信息：
 *    ver=10
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
  loc_infourl varchar(250),                 /* 在查看位置界面底部显示的超链接,可点击跳转 */
  loc_precision integer                     /* 位置精度 ver=7*/
);


/*系统变量 var=5*/
create table sysvar(
  syva_id integer primary key,
  syva_update datetime,                      /*更新时间网站*/
  syva_adminpw char(20)                      /*管理员密码 ver=8*/
);

/*格言 var=6*/
create table motto(
  mot_id integer primary key autoincrement,
  mot_txt char(50) not null, 
  mot_time datetime,                      /*收集时间*/
  mot_from varchar(200),                  /*来由*/
  mot_stop bool default false             /*是否删除掉*/ 
);


/*读书 ver=9*/
create table books(
  boo_isbn char(20) primary key,         /*ISBN*/
  boo_name varchar(100),                 /*书名*/
  boo_price float,                       /*书的购买价格*/
  boo_img blob,                          /*书的图片*/
  boo_tag varchar(20),                   /*书的标签*/
  boo_buytime datetime,                  /*购买时间*/
  boo_pubdate char(10),                  /*出版年*/
  boo_state integer default 0,           /* =0 表示读过,1=在读 */
  boo_url varchar(50),                   /* 外部页面*/
  boo_summary blob,                      /* 书的说明*/
  boo_catalog blob,                      /* 书的章节*/
  boo_publisher char(30),                /* 书的出版社*/ 
  boo_doubandata blob                    /* douban的数据源*/ 
  
);

/*读书笔记 ver=10*/
create table books_notes(
  bno_guid char(36) primary key,        /*日记guid*/
  boo_isbn char(20),                    /*对应读书*/
  bno_time datetime,                    /*日期*/
  loc_guid char(36),                    /*地点*/
  bno_txt varchar(250),                 /*笔记内容*/
  bno_page integer,                     /*页码*/
  bno_title varchar(50),                /*章节名称*/
  bno_viewstyle integer default 0,      /*=0 所有人都能看,=1表示自己才能看*/
  
);
