/*
 * 作者：龙仕云  2015-5-12
 *  blog。
 * 
 *  评论采用的是第三方组件：http://www.uyan.cc/sites  
 *   账号: mrlong@mrlong.cn  密码：7895123
 *
 */
var express = require('express');
var db = require('../db');
var markdown = require('markdown').markdown;


var router = express.Router();

//取出当前最新的内容。
// backcall 参数：
//  err
//  txt  格言内容。
router.get('/',function(req,res,next){  
  var page = req.query['page']||1;
  var startpage = (page-1)*10;
  
  var mywhere = req.session.adminlogin?'(1=1)':'(blo_viewstyle=0)';
  
  //db.query('select * from blog where ?  order by blo_createtime desc limit ?,10',
  //         [mywhere,startpage],function(err,rows,db){
  db.query('select * from blog where '+ mywhere +' order by blo_createtime desc limit ?,10',[startpage],function(err,rows,db){
    
    if(!err){
      db.get('select count(*) as rowcount from blog where ' + mywhere,function(err,row){
        
        //简要的说明
        rows.forEach(function(row){
          row.subhtml=row.blo_html.substring(0,200).replace(/<([^>]*)>/g,'')
            .replace(/<\\s*img\\s+([^>]*)\\s*>/g,'')
            .replace(/src=\"([^\"]+)\"/g,'')
            .replace(/|/g,'')
            .replace(/-/g,'');
          //<([^>]*)>

        });
        
        res.loadview('showblog.html', {rows:rows,curpage:page,rowcount:row.rowcount});
        
      });
    }
    else{
      res.msgBox('读取文章出错');
    };
  });
  
});


//增加
router.get('/add',function(req,res,next){
  res.loadview('blog_add.html');
});
router.post('/add',function(req,res,next){
  var title = req.body.title;
  var viewstyle = req.body.viewstyle || 0;
  var post = req.body.post;
  var tag = req.body.tag;
  var html = markdown.toHTML(post);
  
  var guid = db.newGuid();
  
  db.query('insert into blog(blo_guid,blo_tag,blo_title,blo_text,blo_html,blo_viewstyle) values(?,?,?,?,?,?)',
           [guid,tag,title,post,html,viewstyle],function(err){
    
    if(!err){
      res.redirect('/blog');
    }
    else{
      res.msgBox('保存出错'+err,'/blog'); 
    }
  
  });
  
});

//显示
router.get('/view/:guid',function(req,res,next){
  var blo_guid = req.params.guid;
  
  db.query('select * from blog where blo_guid=?',[blo_guid],function(err,rows){
    if(!err && rows.length>0){
      res.loadview('blog_view.html',{row:rows[0],blog_guid:blo_guid});
    }
    else{
      res.msgBox('找不到相关的文章'); 
    }
  
  });
});


//编辑
router.get('/edit/:guid',function(req,res,next){
  var blo_guid = req.params.guid;
  db.query('select * from blog where blo_guid=?',[blo_guid],function(err,rows){
    if(!err && rows.length>0){
      res.loadview('blog_edit.html',{row:rows[0]});
    }
    else{
      res.msgBox('找不到相关的文章'); 
    }
  });
});

router.post('/edit',function(req,res,next){
  var blo_guid = req.body.blo_guid;
  
  var title = req.body.title;
  var viewstyle = req.body.viewstyle || 0;
  var post = req.body.post;
  var tag = req.body.tag;
  var html = markdown.toHTML(post);

  db.exec('update blog set blo_title=?,blo_tag=?,blo_text=?,blo_html=?,blo_viewstyle=? where blo_guid=?',
          [title,tag,post,html,viewstyle,blo_guid],function(err){
    if(!err){
      res.redirect('/blog/view/'+blo_guid);
    }
    else{
      res.msgBox('修改文章出错');
    }
  });
  
});


var html_decode =function(str){
  var s = "";   
  if (str.length == 0) return "";  
  s = str;
//  s = str.replace(/&gt;/g, "&");   
  s = s.replace(/&lt;/g, "<");   
  s = s.replace(/&gt;/g, ">");   
  s = s.replace(/&nbsp;/g, " ");   
  s = s.replace(/&#39;/g, "\'");   
  s = s.replace(/&quot;/g, "\"");   
  s = s.replace(/<br>/g, "\n");   
  return s;   
}; 

router.get('/ppt/:filename',function(req,res,next){
  var filename = req.params.filename;
  res.loadview('ppt/' + filename);
  
});









module.exports = router;