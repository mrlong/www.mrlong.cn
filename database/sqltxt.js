//sql语句 ，用于以后的更新。
//
// 书写更新的sql语句
//
//

module.exports = {
  verstion : 29,
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
               "mot_stop bool default false)"},
    {ver:7,txt:"ALTER TABLE location ADD COLUMN loc_precision integer"},
    {ver:8,txt:"ALTER TABLE sysvar ADD COLUMN syva_adminpw char(20)"},
    {ver:9,txt:"create table books(" + 
               "boo_isbn char(20) primary key," + 
               "boo_name varchar(100), " +
               "boo_price float," +
               "boo_img blob, " + 
               "boo_tag varchar(20)," +
               "boo_pubdate char(10)," +
               "boo_buytime datetime," +
               "boo_state integer default 0," + 
               "boo_url varchar(50)," + 
               "boo_summary blob," + 
               "boo_catalog blob," + 
               "boo_publisher char(30)," + 
               "boo_doubandata blob)"},
    {ver:10,txt:"create table books_notes(" +
                "bno_guid char(36) primary key, " +
                "boo_isbn char(20)," +
                "bno_time datetime," +
                "loc_guid char(36)," +
                "bno_txt varchar(250), " +
                "bno_page integer," +
                "bno_title varchar(50),   " +
                "bno_viewstyle integer default 0)"},
    {ver:11,txt:"create table footer(" + 
                "foer_guid char(36) primary key," +
                "foer_txt  varchar(250),"+
                "foer_time datetime," + 
                "loc_guid char(36),"  +
                "foer_viewstyle integer default 0," +
                "foer_tag varchar(20) )"},
    {ver:12,txt:"create table image(" + 
                "img_guid char(36) primary key," +
                "img_filename varchar(100), " +
                "img_style integer not null default 0," + 
                "img_content char(50)," +
                "img_time default (datetime('now','localtime')) )"},
    {ver:13,txt:'ALTER TABLE footer ADD COLUMN foer_images varchar(200)'},
    {ver:14,txt:'ALTER TABLE books_notes ADD COLUMN bno_images varchar(200) '},
    {ver:15,txt:'ALTER TABLE image ADD COLUMN img_info varchar(200) '},
    {ver:16,txt:'ALTER TABLE footer ADD COLUMN foer_price float '},
    {ver:17,txt:"create table video( " +
                "vid_guid char(36) primary key," +
                "vid_filename varchar(100)," +
                "vid_filenmae_thumb varchar(100), " +
                "vid_style integer not null default 0," +
                "vid_content char(50), " +
                "vid_time default (datetime('now','localtime'))," +
                "vid_info varchar(200) )"},
    {ver:18,txt:"create table voice( " +
                "voi_guid char(36) primary key," +
                "voi_filename varchar(100)," +
                "voi_style integer not null default 0," +
                "voi_content char(50), " +
                "voi_time default (datetime('now','localtime'))," +
                "voi_info varchar(200) )"},
    
    {ver:19,txt:"ALTER TABLE footer ADD COLUMN foer_video varchar(200)"},
      
    //2015-3-6
    {ver:20,txt:"create table friend("+
                "fri_guid char(36) primary key," +
                "fri_name char(20) not null , " +
                "fri_moblie varchar(100), " +
                "fri_createtime datetime default (datetime('now','localtime'))," +
                "fri_qq  char(15)," +
                "fri_birthday datetime," +
                "fri_tag varchar(50), " +
                "fri_from varchar(50), " +
                "fri_join char(36), " +
                "fri_note varchar(50)," + 
                "fri_usetime datetime " +
                ")"},
    {ver:21,txt:"ALTER TABLE image ADD COLUMN img_who varchar(100)"},
    {ver:22,txt:"ALTER TABLE footer ADD COLUMN foer_who varchar(200)"},
    {ver:23,txt:"ALTER TABLE footer ADD COLUMN foer_whoname varchar(200)"},
    
    //2015-3-10
    {ver:24,txt:"create table cost(" +
                "cos_guid char(36) primary key," +
                "cos_name varchar(100)," +
                "cos_price float default 0," +
                "cos_time datetime default (datetime('now','localtime'))," +
                "cos_tag varchar(20),  " +
                "cos_images varchar(200)," +
                "foer_guid char(36)," +
                "loc_guid char(36)" + 
                ")"},
    //end
    
    //201503018
    {ver:25,txt:"create table remind("+
                "rem_guid char(36) primary key," +
                "rem_txt varchar(255)," +
                "rem_time datetime not null," +
                "rem_issend bool default false" +
                ")"
    
    },
    //end
    
    //201505012
    {ver:26,txt:"create table blog(" +
                "blo_guid char(36) primary key , " +
                "blo_createtime datetime default (datetime('now','localtime')), " +
                "blo_tag varchar(50), " +
                "blo_title varchar(250)," +
                "blo_text blob , " +
                "blo_html blob, " +
                "blo_viewstyle integer default 0 " +
                ")"
    },
        
    //end 
    
    //2015-11-11 双 11
    {ver:27,txt:"ALTER TABLE books ADD COLUMN boo_readendtime datetime default null"},
    //end
    
    //2016-3-11 增加misfit的智能设备关联
    {ver:28,txt:"create table fit(" + 
                 "fit_date date primary key," +
                 "fit_points integer default 0," +
                 "fit_targetPoints integer default 0," +
                 "fit_steps integer default 0," +
                 "fit_calories float," + 
                 "fit_activityCalories float," + 
                 "fit_distance float," +
                 "fit_sleep_autoDetected boolean ," +
                 "fit_sleep_startTime datetime," +
                 "fit_sleep_duration integer default 0 " +
     
                ");" +
                "create table fititems(" +
                "fie_guid char(36) primary key," +
                "fit_date date not null," +
                "fie_activitytype varchar(50)," +
                "fie_startTime datetime," +
                "fie_duration integer, " +
                "fie_points integer, " +
                "fie_steps integer," +
                "fie_calories float," +
                "fie_distance float" +
                ")" 
                
    },

    //2019-4-07 
    //ver=29
    {ver:29,txt:"create table fithouse(" +
              "fih_guid char(36) primary key , " +
              "fih_createtime datetime default (datetime('now','localtime'))," +  
              "fih_longtime integer," +
              "loc_guid char(36)," +
              "fih_style integer," +
              "fih_group_type1 integer," +
              "fih_group_num1 integer,"  +
              "fih_group_count1 integer," +
              "fih_group_calories1 float," +
              "fih_group_type2 integer," +
              "fih_group_num2 integer,"  +
              "fih_group_count2 integer," +
              "fih_group_calories2 float," +
              "fih_group_type3 integer," +
              "fih_group_num3 integer,"  +
              "fih_group_count3 integer," +
              "fih_group_calories3 float," +
              "fih_group_type4 integer," +
              "fih_group_num4 integer,"  +
              "fih_group_count4 integer," +
              "fih_group_calories4 float," +
              "fih_group_type5 integer," +
              "fih_group_num5 integer,"  +
              "fih_group_count5 integer," +
              "fih_group_calories5 float," +
              "fih_group_type6 integer," +
              "fih_group_num6 integer,"  +
              "fih_group_count6 integer," +
              "fih_group_calories6 float," +
              "fih_group_type7 integer," +
              "fih_group_num7 integer,"  +
              "fih_group_count7 integer," +
              "fih_group_calories7 float," +
              "fih_group_type8 integer," +
              "fih_group_num8 integer,"  +
              "fih_group_count8 integer," +
              "fih_group_calories8 float," +
              "fih_remark varchar(100)" + 
              ")"
    }
    //end ver=29
  
  ]  
};



// module.exports 不同点就这样显示出来。
//exports.sqltxt = sqltxt

