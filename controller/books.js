/*
 *
 * 我的读书
 *  作者：龙仕云  2015-2-8 
 *
 * 方法：
 *  采用 douban 的 api : https://api.douban.com/v2/book/isbn/9787121070389
 *          
 * 
 *
 */

var express = require('express');
var db = require('../db');
var urllib = require('urllib');
var util = require('../util');


var router = express.Router();

//显示书
router.get('/',function(req,res,next){
  var page = req.query['page']||1;
  var startpage = (page-1)*20;
  db.query('select boo_isbn,boo_name,boo_pubdate,boo_buytime,boo_publisher,boo_summary, ' + 
           'boo_buytime,boo_tag,boo_price,boo_state from books order by boo_buytime desc limit ?,20',
           [startpage],function(err,rows,db){
    if(!err){
      db.get('select count(*) as rowcount,sum(boo_price) as totle from books',function(err,row){
        res.render('./views_pc/showbooks.html', {rows:rows,
                                        curpage:page,
                                        rowcount:row.rowcount,
                                        totle:parseInt(row.totle)});
      
      });
        
    }
    else
      res.render('./views_pc/showbooks.html', {rows:[],curpage:1,rowcount:0,totle:0});
  });  
});


//增加图书
/* douban的格式如下：
{ rating: { max: 10, numRaters: 301, average: '8.0', min: 0 },
  subtitle: '',
  author: [ 'Jasmin Blanchette', 'Mark Summerfield' ],
  pubdate: '2008-8',
  tags: 
   [ { count: 262, name: 'QT', title: 'QT' },
     { count: 192, name: 'C++', title: 'C++' },
     { count: 142, name: 'GUI', title: 'GUI' },
     { count: 72, name: '编程', title: '编程' },
     { count: 53, name: '计算机', title: '计算机' },
     { count: 38, name: '界面', title: '界面' },
     { count: 36, name: 'Qt4', title: 'Qt4' },
     { count: 33, name: 'C/C++', title: 'C/C++' } ],
  origin_title: '',
  image: 'http://img3.douban.com/mpic/s5934624.jpg',
  binding: '',
  translator: [ '闫锋欣' ],
  catalog: '第一部 分Ql基础============================================\n第1章 Qt入门\n1.1 Hello Qt\n第2章 创建对话框\n2.1 子类化QI)ialog\n2.2 深入介绍信号和槽\n第3章 创建主窗口\n第4章 实现应用程序的功能\n4.1 中央窗口部件\n第5章 创建自定义窗口部件\n第二部分 Ot中级============================================\n第6章 布局管理\n第7章 事件处理\n第8章 二维图形\n第9章 拖放\n第10章 项视图类\n第11章 容器类\n第12章 输入与输出\n12.1 读取和写入二进制数据\n第13章 数据库\n第14章 多线程\n第15章 网络\n15.1写FTP客户端\n第16章 XML\n16.1 使用QXmlStreamReader读取XML\n第17章 提供在线帮助\n第三部分 Qt高级============================================\n第18章 国际化\n第19章 自定义外观\n第20章 三维图形\n第21章 创建插件\n第22章 应用程序脚本\n第23章 平台相关特性\n第24章 嵌入式编程\n24.1 从Ot／Embedded Linux开始\n第四部分 附录\n附录A Qt的获取和安装\n附录B 编译Qt应用程序\n附录C Qt Jambi简介\n附录D 面向Java和C#程序员的C++简介\nD.1 C++入门\nD.2 主要语言之间的差异\nD.3 c++标准库',
  pages: '492',
  images: 
   { small: 'http://img3.douban.com/spic/s5934624.jpg',
     large: 'http://img3.douban.com/lpic/s5934624.jpg',
     medium: 'http://img3.douban.com/mpic/s5934624.jpg' },
  alt: 'http://book.douban.com/subject/3173123/',
  id: '3173123',
  publisher: '电子工业出版社',
  isbn10: '7121070383',
  isbn13: '9787121070389',
  title: 'C++GUI Qt4编程',
  url: 'http://api.douban.com/v2/book/3173123',
  alt_title: '',
  author_intro: '',
  summary: '《C++GUIQt4编程》(第2版)详细讲述了用最新的Qt版本进行图形用户界面应用程序开发的各个方面。前5章主要涉及Qt基础知识，后两个部分主要讲解Qt的中高级编程，包括布局管理、事件处理、二维／三维图形、拖放、项视图类、容器类、输入／输出、数据库、多线程、网络、XML、国际化、嵌入式编程等内容。对于《C++GUIQt4编程》(第2版)讲授的大量Qt4编程原理和实践，都可以轻易将其应用于Qt4．4、Qt4．5以及后续版本的Qt程序开发过程中。',
  price: '65.00元' }
*/


router.post('/addbook',function(req,res,next){
  //参数
  var isbn = req.body.boo_isbn || '';
  var title = req.body.boo_title;           //书名
  var book_tag = req.body.boo_tag;          //书的书签
  var book_price = req.body.boo_price || 0; //书的价格。
  var book_buytime = req.body.boo_buytime;  //书的购买时间。
  var book_state  = req.body.boo_state || 0; //状态
  
  if(!req.session.adminlogin){
    
    return;
  }
  
  //确定库内有没有
  if(isbn==''){
    res.json({success:false,msg:"ISBN不能为空。"});
  }
  else {
    db.query('select * from books where boo_isbn=?',[isbn],function(err,rows){
      if(err || rows.length>0){
        res.json({success:false,msg:"图书已存在或执行查书是不否存在出错"});
      }
      else{
        //增加入库。
        //关键地方，因为在采用调用外部的ip来获取数据。
        var bookurl = 'https://api.douban.com/v2/book/isbn/' + isbn;
        urllib.request(bookurl,{dataType:'json'}, function(err, data, res_url){
          if(!err && res.statusCode==200){
            if (data.code && data.msg){
              //{"msg":"book_not_found","code":6000,"request":"GET \/v2\/book\/isbn\/97871210703898"}
              db.exec('insert into books(boo_isbn,boo_name,boo_tag,boo_price,boo_buytime,boo_state) values(?,?,?,?,?,?)',
                      [isbn,title,book_tag,book_price,book_buytime,book_state]);
              res.json({success:true,msg:"只增加ISBN到库内,从douban得到的信息"+data.msg});
            }
            else{
              //写入库了。
              //1.取出书的图片
              urllib.request(data.image,{},function(err,data_img,res_url){
                db.exec('insert into books(boo_isbn,boo_name,boo_img,boo_summary,boo_catalog,boo_publisher,' +
                        'boo_doubandata,boo_pubdate,boo_url,boo_tag,boo_price,boo_buytime,boo_state) values(?,?,?,?,?,?,?,?,?,?,?,?,?)',
                  [isbn,data.title,data_img,data.summary,data.catalog,data.publisher,
                   JSON.stringify(data),data.pubdate,data.url,book_tag,book_price,book_buytime,book_state],function(err){
                  res.json({success:err==null,msg:!err?"保存到数据库成功":"保存到数据库失败"});
                
                });
              });
              //end 写入完成
            }
          }
          else{
            //获取出错。
            //是否直接写入库内
            db.exec('insert into books(boo_isbn,boo_name,boo_tag,boo_price,boo_buytime,boo_state) values(?,?,?,?,?,?)',
                    [isbn,title,book_tag,book_price,book_buytime,book_state],function(err){
              res.json({success:!err,msg:err?"从douban内无法取出图书信息，并保存到库出错":"从douban内无法取出图书信息，只增加ISBN到库内。"});
            });
            
          };
        
        });
      }
      
    });
    
  }

});

//
// 取出书的图片
// 
//
router.get('/bookimg/:isbn',function(req,res,next){
  var isbn = req.params.isbn;
  
  db.query('select boo_img from books where boo_isbn=?',[isbn],function(err,rows){
    if(!err && rows.length>0){
      res.set('Content-Type', 'image/jpg');
      res.status(200).send(rows[0].boo_img); 
    }
    else{
      res.status(404).send('Sorry, not find that!'); 
    }
  });

});

//
// 删除书
//

router.post('/delbook',function(req,res,next){
  var isbn = req.body.isbn;
  
  if(req.session.adminlogin){
    db.exec("delete from books where boo_isbn=?",[isbn],function(err){
      res.json({success:!err,msg:!err?"删除成功":"无法从库同删除"});
    });
  }
  else{
   res.json({success:false,msg:"你需要登录"}); 
  }  
});

//
// 取出书的祥细信息
//
router.get('/info/:isbn',function(req,res,next){
  var isbn = req.params.isbn;
  db.query('select boo_isbn,boo_doubandata from books where boo_isbn=?',[isbn],function(err,rows){
    if(!err && rows.length>0){
      res.render('./views_pc/bookinfo.html',{isbn:isbn,book:JSON.parse(rows[0].boo_doubandata)});  
    }
    else{
      res.end(util.errBox('打不到这本书','/books'));
    }
  });

});


module.exports = router;