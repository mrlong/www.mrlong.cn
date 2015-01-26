

var http = require('http');
var fs = require('fs');
var db = require('../db.js');

var  getFileName = function(filename){
  /*var myDate = new Date();	
  var minute  = myDate.getMinutes()<10 ? '0' + myDate.getMinutes():myDate.getMinutes();
  var seconds = myDate.getSeconds()<10 ? '0' + myDate.getSeconds():myDate.getSeconds();
  var month   = myDate.getMonth()+1 < 10 ? '0' + (myDate.getMonth()+1):(myDate.getMonth()+1);
  var day     = myDate.getDate()<10 ? '0' + myDate.getDate():myDate.getDate();
  var hour    = myDate.getHours()<10 ? '0' + myDate.getHours():myDate.getHours();
  
  var filename = myDate.getFullYear()+month.toString()+day.toString()+"_"+hour.toString()+minute.toString()+ seconds.toString()+'.jpg';
  */
  return  '/var/www/mrlong.cn/public/shf/'+filename+'.jpg';
}

var downloadfile = function(url,callabck){

http.get(url,function(e) {
    var data='';
    e.setEncoding('binary');
  	e.on('data',function(d){
			data+=d.toString();		
		});

		e.on('end',function(e){
          var fileguid = db.newGuid();
		  var filename = getFileName(fileguid);
          
		  console.log(filename);
		  fs.writeFile(filename, data, 'binary',function (err) {
  			if (!err) {
                //写入库内
                db.exec('insert into shfimg(zguid,txt,imgfile) values(?,?,?)',[fileguid,'',fileguid+'.jpg'],function(err){
                  if (!err){
                    callabck(null,'图片上传成功');          
                  }
                  else{
                    callabck(err,'图片写入库sqlite出错');  
                  }
                });
  				
  			}else{
  				callabck(err,'下载到www.mrlong.cn服务器出错。');
  			}
		  });
		});

	}).on('error',function(e){
		callabck(e,'从微信下载图下出错');
	}).end();

};

module.exports=downloadfile;

