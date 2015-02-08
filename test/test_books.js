
var urllib = require('urllib');
var fs = require('fs');
var db = require('./db');

var isbn = '9787121070389';
var bookurl = 'https://api.douban.com/v2/book/isbn/' + isbn;

console.log(bookurl);
urllib.request(bookurl,{dataType:'json'},function(err,data,res){
  
    console.log(data);
  
  urllib.request(data.image,{},function(err,data,res){
     var file = fs.createWriteStream('example.jpg');
      file.write(data);
  
  });
  

});