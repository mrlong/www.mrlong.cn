var connect = require('connect');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

var app = connect();

app.use(connect.query());
app.use(connect.static(__dirname + '/public', { maxAge: 86400000 }));

// app.use(function(req,res,next){
// 	var name = req.query.name;
// 	res.end('hello' + name);
// });

var tpl = ejs.compile(fs.readFileSync(path.join(__dirname, 'views/index.html'),'utf-8'));
app.use(function (req, res,next) {	
  var data=[];
	//var filenames = fs.readdirSync(__dirname + '/public/shf');
  //对文件进行排序
  fs.readdir(__dirname + '/public/shf', function(err, filenames){
    filenames.sort(function(val1, val2){
      //读取文件信息
      var stat1 = fs.statSync(__dirname + '/public/shf/' + val1);
      var stat2 = fs.statSync(__dirname + '/public/shf/' + val2);
      //根据时间从最新到最旧排序
      return stat2.mtime - stat1.mtime;
    });

    for (i = 0; i < filenames.length; i++) {  
      if((filenames[i].indexOf('.jpg')>0) || (filenames[i].indexOf('.JPG')>0)) {
    	   data.push(filenames[i]);
    	   if(data.length>5){break;};
      };
	   };  
    res.writeHead(200);
    //console.log(data);
    res.end(tpl({'imgs':data}));  	 
  });
});


app.listen(3002);
console.log('mrlong.cn stated on port 3002');