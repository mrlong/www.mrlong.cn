/*
/*  数据加采用sqlite
/*
*/

/*
 *  版本信息：
 *    ver=27
 *
 */


/*书法索引*/

CREATE TABLE shfimg(
  zguid CHAR(36) Primary Key,   /*guid*/
  ct  datetime default (datetime('now','localtime')),        /*创建时间*/
  txt VARCHAR(250),                 /*说明*/
  imgfile VARCHAR(250) not null,    /*文件名，文件固定存放在./public/shf目录之内,从2015-2-19改为采用统一的image库存放，这个值就是image的guid*/
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
  loc_style integer not null default 0,     /*0=表示没有关联上的， 内容类型 1=书法的拍照位置 2=读书笔记位置 3=我的足迹 4=我的花销 5=健身房*/
  loc_content char(50),                     /*关联内容的信息，如是书法，则这个是书法的zguid*/
  loc_latitude integer,                     /* 纬度，浮点数，范围为90 ~ -90*/
  loc_longitude integer,                    /* 经度，浮点数，范围为180 ~ -180。*/
  loc_name varchar(250),                    /* 位置名*/
  loc_address varchar(250),                 /* 地址的祥情说明*/
  loc_scale integer,                        /* 地图缩放级别,整形值,范围从1~28。默认为最大 */
  loc_infourl varchar(250),                 /* 在查看位置界面底部显示的超链接,可点击跳转 */
  loc_precision integer                     /* 位置精度 ver=7*/
  /*loc_time datetime default (datetime('now','localtime')) /* ver=25 * 原因是无法增加。放到后面了/
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
  boo_doubandata blob,                   /* douban的数据源(内有很多数)*/ 
  boo_readendtime datetime               /* 读完时间 ver=27*/
  
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
  bno_images varchar(200)               /* 关联的图片guid,多个采用,号隔开 var=14*/
  
);

/*我的足迹 var＝11*/
create table footer(
  foer_guid char(36) primary key,
  foer_txt  varchar(250),              /*内容*/
  foer_time datetime,                  /*时间*/
  loc_guid char(36),                   /*位置*/
  foer_viewstyle integer default 0,    /* 0=公开  1=私有*/
  foer_tag varchar(20),                /*标签*/
  foer_images varchar(200),            /* 关联的图片guid,多个采用,号隔开 var=13*/
  foer_price float                     /* 费用多少ver=16 */
  foer_video varchar(200),             /*视频内容 ver=19*/  
  foer_who varchar(200),                /*与friend.fir_guid关联 内有多人时，可以采用,号分开 var=22*/
  foer_whoname varchar(200)            /*与friend.fir_name,用于显示之用var=23*/
);

/*图片资源表 ver=12*/
create table image(
  img_guid char(36) primary key,         /*, */
  img_filename varchar(100),             /*文件的原名称 保存在图定的位置，暂定在database/images 下面,与guid进行命名*/
  img_style integer not null default 0,  /*类型 1=我的足迹的图片 2=书法图片 3=读书笔记的图片 4=我的花销 99=手动上传*/
  img_content char(50),                  /*关联内容的信息，如是我的足迹，则这个是我的足迹的guid*/
  img_time datetime default (datetime('now','localtime')),
  img_info varchar(200),                 /*图片说明内容 ver=15 */
  img_who varchar(100)                   /*与friend.fir_guid关联 内有多人时，可以采用,号分开 var=21*/
);

/*视频资源表 ver=17*/
create table video(
  vid_guid char(36) primary key,
  vid_filename varchar(100),             /*文件原名称，保存在固定的位置，/database/videos 下面，与guid进行命名*/
  vid_filenmae_thumb varchar(100),       /*视频消息缩略图,保存在固定的位置，/database/videos 下面*/
  vid_style integer not null default 0,  /*类型 1=我的足迹的频视*/
  vid_content char(50),                  /*关联内容的信息，如是我的足迹，则这个是我的足迹的guid*/
  vid_time datetime default (datetime('now','localtime')),
  vid_info varchar(200)                  /*内容说明内容 ver=15 */ 
);

/*语言资源表 ver=18*/
create table voice(
  voi_guid char(36) primary key,
  voi_filename varchar(100),             /*文件原名称，保存在固定的位置，/database/voices 下面，与guid进行命名*/
  voi_style integer not null default 0,  /*类型 暂空的*/
  voi_content char(50),                  /*关联内容的信息，如是我的足迹，则这个是我的足迹的guid*/
  voi_time default (datetime('now','localtime')),
  voi_info varchar(200)                  /*内容说明内容 ver=15 */  
);

/*人脉交际 ver=20*/
create table friend(
  fri_guid char(36) primary key,
  fri_name char(20) not null ,         /*姓名*/
  fri_moblie varchar(100),             /*电话,多个以,分开*/
  fri_createtime datetime default (datetime('now','localtime')), /*创建时间*/
  fri_qq  char(15),                    /*qq*/
  fri_birthday datetime,               /*生日*/
  fri_tag varchar(50),                 /*标签*/
  fri_from varchar(50),                /*来源*/
  fri_join char(36),                   /*什么人介绍*/
  fri_note varchar(50),                /*备注*/
  fri_usetime datetime                 /*最后使用时间，用于排序选择之用*/
);

/*我的花销 ver=24*/
create table cost(
  cos_guid char(36) primary key,
  cos_name varchar(100),              /*名称说明*/
  cos_price float default 0,          /*费用*/
  cos_time datetime default (datetime('now','localtime')), /*创建时间*/
  cos_tag varchar(20),                /*标签*/
  cos_images varchar(200),            /*相关图片 image.style=4*/
  foer_guid char(36),                 /*哪个活动的开支*/
  loc_guid char(36)                   /*地图信息内容，如有说明花费的位置,如来自足迹则这个是我的足迹的值*/
);
  
/*提醒 ver=25*/
create table remind(
  rem_guid char(36) primary key,
  rem_txt varchar(255),
  rem_time datetime not null,
  rem_issend bool default false     /*=ture 表示已发出邮件*/
);

/* blog ver=26 */
create table blog(
    blo_guid char(36) primary key ,
    blo_createtime datetime default (datetime('now','localtime')), /*创建时间*/
    blo_tag varchar(50),  /*分类*/
    blo_title varchar(250), /*标题*/
    blo_text blob ,   /*内容*/
    blo_html blob,    /*html之后的内容*/
    blo_viewstyle integer default 0   /* 0=公开  1=私有*/
);
  
  
/* misfit ver=28 增加智能设备 */
create table fit(
  fit_date date primary key,
  fit_points integer default 0,  /*实现情况*/
  fit_targetPoints integer default 0, /*目标情况*/
  fit_steps integer default 0,  /*步数*/
  fit_calories float, /*卡路里*/
  fit_activityCalories float, /*活动卡路里*/
  fit_distance float, /*距离*/
  fit_sleep_autoDetected boolean, /*自动检测*/
  fit_sleep_startTime datetime,   /*开始时间*/
  fit_sleep_duration integer default 0 /*长短*/
);
  
/*健身明细 ver=28*/
create table fititems(
  fie_guid char(36) primary key,  /*主键*/
  fit_date date not null,     /*关联fit的值*/
  fie_activitytype varchar(50),
  fie_startTime datetime,     /*开始时间*/
  fie_duration integer,       /*为期*/
  fie_points integer,         /*点*/
  fie_steps integer,          /*步数*/
  fie_calories float,          /*卡路里*/
  fie_distance float           /*距离*/
);

/*健身房 ver=29*/
create table fithouse{
  fih_guid char(36) primary key ,
  fih_createtime datetime default (datetime('now','localtime')), /*创建时间*/
  fih_longtime 1233,            /*时长，单位分钟*/
  loc_guid char(36),            /*位置*/
  fih_style integer,            /*=1 表示自由训练 2=私教*/
  
  fih_group_type1 integer,      /*0=无，1=胸 2=背 3=核心  4=大腿 5=跑步*/
  fih_group_num1 integer,       /*几组*/
  fih_group_count1 integer,     /*每组多少个*/
  fih_group_calories1 float,    /*多少卡路里*/ 

  fih_group_type2 integer,      /*0=无，1=胸 2=背 4=核心  5=大腿*/
  fih_group_num2 integer,       /*几组*/
  fih_group_count2 integer,     /*每组多少个*/
  fih_group_calories2 float,    /*多少卡路里*/ 

  fih_group_type3 integer,      /*1=胸 2=背 4=核心  5=大腿*/
  fih_group_num3 integer,       /*几组*/
  fih_group_count3 integer,     /*每组多少个*/
  fih_group_calories3 float,    /*多少卡路里*/ 

  fih_group_type4 integer,      /*1=胸 2=背 4=核心  5=大腿*/
  fih_group_num4 integer,       /*几组*/
  fih_group_count4 integer,     /*每组多少个*/
  fih_group_calories4 float,    /*多少卡路里*/ 

  fih_group_type5 integer,      /*1=胸 2=背 4=核心  5=大腿*/
  fih_group_num5 integer,       /*几组*/
  fih_group_count5 integer,     /*每组多少个*/
  fih_group_calories5 float,    /*多少卡路里*/ 

  fih_group_type6 integer,      /*1=胸 2=背 4=核心  5=大腿*/
  fih_group_num6 integer,       /*几组*/
  fih_group_count6 integer,     /*每组多少个*/
  fih_group_calories6 float,    /*多少卡路里*/ 

  fih_group_type7 integer,      /*1=胸 2=背 4=核心  5=大腿*/
  fih_group_num7 integer,       /*几组*/
  fih_group_count7 integer,     /*每组多少个*/
  fih_group_calories7 float,    /*多少卡路里*/ 

  fih_group_type8 integer,      /*1=胸 2=背 4=核心  5=大腿*/
  fih_group_num8 integer,       /*几组*/
  fih_group_count8 integer,     /*每组多少个*/
  fih_group_calories8 float,    /*多少卡路里*/ 

  fih_remark varchar(100),      /*备注*/

};

  


  


