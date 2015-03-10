//sql语句 ，用于以后的更新。
//
// 书写更新的sql语句
//
//

module.exports = {
  verstion : 24,
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
        
    
    
    
     
    

  ]  
};





// module.exports 不同点就这样显示出来。
//exports.sqltxt = sqltxt

