
var urllib = require('urllib');
var fs = require('fs');
var Buffer = require('buffer').Buffer;
var db = require('../db');

var isbn = '9787121070389';
var bookurl = 'https://api.douban.com/v2/book/isbn/' + isbn;

console.log(bookurl);
urllib.request(bookurl,{dataType:'json'},function(err,data,res){
  
    console.log(data);
  
  urllib.request(data.image,{},function(err,data2,res){
    if(!err && res.statusCode===200){
      //写入库内
      db.exec('delete from books',function(err){
        db.exec('insert into books(boo_isbn,boo_name,boo_img,boo_summary,boo_catalog,boo_publisher,boo_doubandata) values(?,?,?,?,?,?,?)',
                [isbn,data.title,data2,data.summary,data.catalog,data.publisher, JSON.stringify(data)],function(err,db){
          console.log(err);
          var file = fs.createWriteStream('example.jpg');
          file.write(data2);
          
          //读了来
          db.all('select * from books',function(err,rows){
            if (err) throw err;
            console.log(Buffer.isBuffer(rows[0].boo_img));
            fs.createWriteStream('example2.jpg').write(rows[0].boo_img);
            console.log(JSON.parse(rows[0].boo_doubandata).title);  //取出对象来。转成对象
          });
          //end 
          
        });
      });
      
     
    }
    else {
      console.log('err'); 
    };
  
  });
  
 
});