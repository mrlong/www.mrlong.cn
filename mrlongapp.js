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
	var filenames = fs.readdirSync(__dirname + '/public/shf');  
	for (i = 0; i < filenames.length; i++) {  
    if(filenames[i].indexOf('.JPG')>0){
    	data.push(filenames[i]);
    	if(data.length>5){break;};
    };
	};  
  res.writeHead(200);
  res.end(tpl({'imgs':data}));  	 
});


app.listen(3002);
console.log('mrlong.cn stated on port 3002');