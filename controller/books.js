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
var API = require('../wechat/api');
var config = require('../config');
var wxconfig = require('../wxconfig');
var EventProxy = require('eventproxy');


var router = express.Router();
var api = new API(config.weixin.appid,config.weixin.appsecret);

//显示书
router.get('/',function(req,res,next){
  var page = req.query['page']||1;
  var startpage = (page-1)*20;

  db.query('select boo_isbn,boo_name,boo_pubdate,boo_buytime,boo_publisher,boo_summary, ' + 
           'boo_buytime,boo_tag,boo_price,boo_state,boo_readendtime from books order by boo_buytime desc limit ?,20',
           [startpage],function(err,rows,db2){
    if(!err){
      db2.get('select count(*) as rowcount,sum(boo_price) as totle from books',function(err,row){

        var ep = new EventProxy();
        ep.after('got_row', rows.length, function (list) {
          res.render('./views_pc/showbooks.html', {rows:rows,
            curpage:page,
            rowcount:row.rowcount,
            notes:list,
            totle:parseInt(row.totle)});
        });
        for (var i = 0; i < rows.length; i++) {
          db.query('select bno_txt,bno_time,boo_isbn from books_notes where boo_isbn="'+ rows[i].boo_isbn+ '" order by  bno_time desc',function(err,notes){
            ep.emit('got_row', !err?notes:[]);
          });
        };      
      });
        
    }
    else{
      res.render('./views_pc/showbooks.html', {rows:[],curpage:1,rowcount:0,totle:0});
    };
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

//增加图书
router.post('/addbook',function(req,res,next){
  //参数
  var isbn = req.body.boo_isbn || '';
  var title = req.body.boo_title;           //书名
  var book_tag = req.body.boo_tag;          //书的书签
  var book_price = req.body.boo_price || 0; //书的价格。
  var book_buytime = req.body.boo_buytime;  //书的购买时间。
  var book_state  = req.body.boo_state || 0; //状态
  var boo_author = req.body.boo_author;
  var boo_translator = req.body.boo_translator;
  var boo_publisher = req.body.boo_publisher;
  var boo_pubdate = req.body.boo_pubdate;
  var boo_pages = req.body.boo_pages;
  var boo_summary = req.body.boo_summary;
  var boo_catalog = req.body.boo_catalog;
  var boo_url = req.body.boo_url;
  var boo_img = req.body.boo_img;  //图片的地址

  if(!req.session.adminlogin){
    return;
  };
  
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
        //1.先下载图片
        urllib.request(boo_img,{},function(err,data_img,res_url){
          db.exec('insert into books(boo_isbn,boo_name,boo_img,boo_summary,boo_catalog,boo_publisher,' +
                  'boo_pubdate,boo_url,boo_tag,boo_price,boo_buytime,boo_state,boo_author,boo_translator,boo_pages) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
             [isbn,title,data_img,boo_summary,boo_catalog,boo_publisher,
              boo_pubdate,boo_url,book_tag,book_price,book_buytime,book_state,boo_author,boo_translator,boo_pages],function(err){
             res.json({success:err==null,msg:!err?"保存到数据库成功":"保存到数据库失败:" + err.message});
          });
        });
      }
    });
  };


  //增加入库。
  //关键地方，因为在采用调用外部的ip来获取数据。
  // var bookurl = 'https://api.douban.com/v2/book/isbn/' + isbn;
  // urllib.request(bookurl,{dataType:'json'}, function(err, data, res_url){
  //   if(!err && res.statusCode==200){
  //     if (data.code && data.msg){
  //       //{"msg":"book_not_found","code":6000,"request":"GET \/v2\/book\/isbn\/97871210703898"}
  //       db.exec('insert into books(boo_isbn,boo_name,boo_tag,boo_price,boo_buytime,boo_state) values(?,?,?,?,?,?)',
  //               [isbn,title,book_tag,book_price,book_buytime,book_state]);
  //       res.json({success:true,msg:"只增加ISBN到库内,从douban得到的信息"+data.msg});
  //     }
  //     else{
  //       //写入库了。
  //       //1.取出书的图片
  //       urllib.request(data.image,{},function(err,data_img,res_url){
  //         db.exec('insert into books(boo_isbn,boo_name,boo_img,boo_summary,boo_catalog,boo_publisher,' +
  //                 'boo_doubandata,boo_pubdate,boo_url,boo_tag,boo_price,boo_buytime,boo_state) values(?,?,?,?,?,?,?,?,?,?,?,?,?)',
  //           [isbn,data.title,data_img,data.summary,data.catalog,data.publisher,
  //            JSON.stringify(data),data.pubdate,data.url,book_tag,book_price,book_buytime,book_state],function(err){
  //           res.json({success:err==null,msg:!err?"保存到数据库成功":"保存到数据库失败"});
          
  //         });
  //       });
  //       //end 写入完成
  //     }
  //   }
  //   else{
  //     //获取出错。
  //     //是否直接写入库内
  //     db.exec('insert into books(boo_isbn,boo_name,boo_tag,boo_price,boo_buytime,boo_state) values(?,?,?,?,?,?)',
  //             [isbn,title,book_tag,book_price,book_buytime,book_state],function(err){
  //       res.json({success:!err,msg:err?"从douban内无法取出图书信息，并保存到库出错":"从douban内无法取出图书信息，只增加ISBN到库内。"});
  //     });
  //   };
  // });

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
  db.query('select * from books where boo_isbn=?',[isbn],function(err,rows,indb){
    if(!err && rows.length>0){
      
      //取出读书的笔记
      var mywhere = req.session.adminlogin?'(1=1)':'(bno_viewstyle=0)';
      indb.all('select * from books_notes where ' + mywhere + ' and boo_isbn=? order by bno_time desc',[isbn],function(err,notes){
        var mynotes = err||notes.length==0?[]:notes;
        res.render('./views_pc/bookinfo.html',{isbn:isbn,
                                               state:rows[0].boo_state,
                                               //book:JSON.parse(rows[0].boo_doubandata),
                                               book:rows[0],
                                               doubook:JSON.parse(rows[0].boo_doubandata||'{}'),
                                               notes:mynotes});  
      });
      
      
    }
    else{
      res.end(util.errBox('打不到这本书','/books'));
    }
  });

});

//
// 设置书已读完
//
router.post('/state/:isbn/:value',function(req,res,next){
  var isbn = req.params.isbn;
  var value = req.params.value || 1;  //=0读完  1=读中。。。
  value = value==0?1:0;
  
  //权限，有没有登录。
  if(!req.session.adminlogin){
    res.json({success:false,msg:'请登录才能修改'});
    return;
  };
  
  
  db.exec("update books set boo_state=?,boo_readendtime=date() where boo_isbn=?",[value,isbn],function(err){
    res.json({success:!err,msg:!err?"设置成功":err});
  });
  
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//读书笔记
//

router.get('/notes',function(req,res,next){
  var page = req.query.page || 1;
  var startpage = (page-1)*20;
  var isbn = req.query.isbn;
  
  if(isbn){
    db.query('select a.*,b.boo_name from books_notes as a left join books as b on a.boo_isbn=b.boo_isbn where a.boo_isbn=? order by a.bno_time desc  ',[isbn],function(err,rows){
      if(!err){
        res.loadview('showbooksnote.html',{rowcount:rows.length,rows:rows,curpage:page});
      }
      else{
        res.msgBox('读取笔记失败','/books'); 
      }
  
    });  
  }
  else{
  
    db.query('select a.*,b.boo_name from books_notes as a left join books as b on a.boo_isbn=b.boo_isbn order by a.bno_time desc limit ?,20 ',[startpage],function(err,rows,db){
      if(!err){
        db.get('select count(*) as mycount from books_notes',function(err,row){
          res.loadview('showbooksnote.html',{rowcount:row.mycount,rows:rows,curpage:page});
        });
      
      }
      else{
        res.msgBox('读取笔记失败','/books'); 
      }
  
    });
  }

});

//增加笔记
router.get('/notes/add',wxconfig.wx,function(req,res,next){
  var txt = req.query.txt;
  db.query('select boo_name,boo_isbn from books where boo_state=1 order by boo_state desc, boo_buytime desc limit  0,10',function(err,rows){
          res.loadview('books_notes_add.html', {'txt':txt,books:rows,'msg':''},true);  
  });
});

router.post('/notes/add',function(req,res,next){
  var txt = req.query.txt;
  var bno_isbn = req.body.book || ''; 
  var bno_txt   = req.body.txt || '';
  var bno_title = req.body.title;
  var bno_page  = req.body.page;
  var lat_lng   = req.body.lat_lng || '';  //地图信息
  var bno_viewstyle = req.body.style || 0;
  
  
        var myloc_guid = null;
        var myguid = db.newGuid();
        
        if(lat_lng){
          var array = lat_lng.split(',');
          var lat = array[0];
          var lng = array[1];
          db.newLocation(2/*表示书法绘画*/,lat,lng,myguid,function(err,loc_guid){
            if(!err) myloc_guid = loc_guid;
              db.exec('insert into books_notes(bno_guid,boo_isbn,bno_txt,bno_title,bno_page,bno_viewstyle,bno_time,loc_guid) values(?,?,?,?,?,?,datetime("now","localtime"),?)',
                  [myguid,bno_isbn,bno_txt,bno_title,bno_page,bno_viewstyle,myloc_guid],function(err){              
                res.msgBox(!err?'保存成功(有位置)':'保存失败(有位置)',true);    
            });  
            
          });

        }
        else{ 
        
        //datetime("now","localtime")
        db.exec('insert into books_notes(bno_guid,boo_isbn,bno_txt,bno_title,bno_page,bno_viewstyle,bno_time) values(?,?,?,?,?,?,datetime("now","localtime"))',
                  [myguid,bno_isbn,bno_txt,bno_title,bno_page,bno_viewstyle],function(err){
              
            res.msgBox(!err?'保存成功':'保存失败',true);
          });                                      
        } //end else
    
});



//
//笔记增加图片
//
router.get('/notes/addimage',function(req,res,next){
  var img_guid = req.query.img_guid;
  db.query('select bno_guid,bno_txt,bno_images from books_notes order by bno_time desc limit 0,5',function(err,rows){
    if(!err){
      res.loadview('books_notes_addimage.html',{rows:rows,img_guid:img_guid},true);
    }
    else{
      res.msgBox('读取笔记出错'+err,true); 
    }
  });
});

router.post('/notes/addimage',function(req,res,next){
  var img_guid = req.body.img_guid;
  var bno_images = req.body.bno_images ||'';
  var bno_guid = req.body.booknote; 
  
  var myimages = bno_images==''? img_guid: bno_images + ',' + img_guid; 
  db.exec('update books_notes set bno_images=? where bno_guid=?',[myimages,bno_guid],function(err,db){
    if(!err){
      db.run('update image set img_style=3 ,img_content=? where img_guid=?',[bno_guid,img_guid],function(err){
        res.msgBox(!err?'保存成功':'更新图片库出错，但关联还在是的',true);
      });
    }
    else{
      res.msgBox('更新关联到笔记出错',true); 
    }
  });

});

//
//取出书名
//
router.get('/notes/bookname',function(req,res,next){
  db.query('select boo_isbn,boo_name from books',function(err,rows){
    res.json({success:true,msg:'',books:!err?rows:[]});
  });
});

//更换书名
router.post('/notes/changebook',function(req,res,next){
  var book_isbn = req.body.book_isbn;
  var bno_guid = req.body.bno_guid;
  db.exec('update books_notes set boo_isbn=? where bno_guid=?',[book_isbn,bno_guid],function(err){
    res.json({success:!err,msg:''});
  });
});


//
// 取出读书的笔记
//
router.get('/notes/:isbn',function(req,res,next){
  var isbn = req.params.isbn;
  db.query('select * from books_notes where boo_isbn=? order by bno_time desc',[isbn],function(err,rows){
    if(!err){
      res.json({success:true,rows:rows,msg:'读取日记成功'});
    }
    else{
      res.json({success:false,msg:'读取日志出错'+err}); 
    }
  });
});

//
//删除读书笔记 
//
router.post('/notes/del/:guid',function(req,res,next){
  var guid = req.params.guid;
  
  //权限，有没有登录。
  if(!req.session.adminlogin){
    res.json({success:false,msg:'请登录才能修改'});
    return;
  };
  
  db.query('delete from books_notes where bno_guid=?',guid,function(err){
    res.json({success:!err,msg:err?'删除出错':'删除成功'});
    return; 
  });

});


module.exports = router;