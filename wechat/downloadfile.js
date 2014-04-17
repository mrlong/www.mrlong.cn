

var http = require('http');
var fs = require('fs');




var  getFileName = function(){
	var myDate = new Date();	
	var minute  = myDate.getMinutes()<10 ? '0' + myDate.getMinutes():myDate.getMinutes();
  var seconds = myDate.getSeconds()<10 ? '0' + myDate.getSeconds():myDate.getSeconds();
  var month   = myDate.getMonth()+1 < 10 ? '0' + myDate.getMonth():myDate.getMonth();
  var day     = myDate.getDate()<10 ? '0' + yDate.getDate():myDate.getDate();
  var hour    = myDate.getHours()<10 ? '0' + myDate.getHours():myDate.getHours();
  
	var filename = myDate.getFullYear()+month+day+"_"+hour+minute+ seconds+'.jpg';
	//return __dirname + '/public/shf/'+filename;
	return filename;
}

var downloadfile = function(url,callabck){

http.get(url,function(e) {
		var data='';
		e.setEncoding('binary');
  	e.on('data',function(d){
			data+=d.toString();		
		});

		e.on('end',function(e){
		  var filename = getFileName();
		  console.log(filename);
			fs.writeFile(filename, data, 'binary',function (err) {
  			if (err) {
  				callabck(err,'保存到本地图片出错');
  			}else{
  				callabck(null,'图片保存成功。');
  			}
			});
		});

	}).on('error',function(e){
		callabck(e,'从微信下载图下出错');
	}).end();

};

module.exports=downloadfile;

