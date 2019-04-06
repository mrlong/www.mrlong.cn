
// message为视频内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'video',
  // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
  // ThumbMediaId: 'media_id',
  // MsgId: '5837397520665436492' }

//下载的路径：
// http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=ACCESS_TOKEN&media_id=MEDIA_ID

var config = require('../config');
var http = require('http');
var fs = require('fs');
var db = require('../db.js');

var donwloadfile_thumb=function(filename_thumb,url,callback){
  http.get(url,function(e) {
    var data='';
    e.setEncoding('binary');	
    e.on('data',function(d){
      data+=d.toString();		
    });

    e.on('end',function(e){         
      fs.writeFile('/var/www/mrlong.cn/database/videos/'+filename_thumb, data, 'binary',function (err) {
        if (!err) {
        }else{
  		  callabck(err,'下载到www.mrlong.cn服务器出错。');
  		}
      });
    });

  }).on('error',function(e){
    callabck(e,'从微信下载视频的缩图出错');
  }).end();
};

var donwloadfile=function(url,url_thumb,callback){
  
  http.get(url,function(e) {
    var data='';
    e.setEncoding('binary');	
    e.on('data',function(d){
      data+=d.toString();		
    });

    e.on('end',function(e){
      var newguid = db.newGuid();
      var filename = newguid+'.aar';
      var filename_thumb = newguid+'.jpg';
      
      //下载缩图
      donwloadfile_thumb(filename_thumb,url_thumb,function(err,msg){
        if(!err){
          //console.log(filename);
          fs.writeFile('/var/www/mrlong.cn/database/videos/'+filename, data, 'binary',function (err) {
            if (!err) {
              //写入库内
              db.exec('insert into video(vid_guid,vid_filename,vid_filenmae_thumb) values(?,?,?)',
                  [fileguid,filename,filename_thumb],function(err){
                if (!err){
                  callabck(null,fileguid);          
                }
                else{
                  callabck(err,'图片写入库sqlite出错');  
                }
              });
            }else{
  		      callabck(err,'下载到www.mrlong.cn服务器出错。');
  		    }
          })
        }
        else{
          callabck(err,msg); 
        }
      });
      //end                      
    });
  }).on('error',function(e){
    callabck(e,'从微信下载图下出错');
  }).end();
};
  


module.exports = function(video, req, res, next){
  //console.log(video);  
  var url = "http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=" + config.weixin.token + "&media_id=" +
            video.MediaId ;
  var url_thumb = "http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=" + config.weixin.token + "&media_id=" +
            video.ThumbMediaId;
      
  donwloadfile(url,url_thumb,function(err,vid_guid){
    if(!err && vid_guid){
      
      var content = ''
      
      content = content + '\n\r' + '1、添加到我的足迹 \r\n http://'  +  config.domain + '/footer/addimage?vid_guid=' + vid_guid; 
      content = content + '\n\r' + '2、上传错了现在删除掉 \r\n http://'  +  config.domain + '/videos/del/' + vid_guid; 
    
 	    res.reply(!err?content:vid_guid);
      
    }
    else{
      res.reply('视频下载失败。'+url);    
    }
  })
  
  
  
  
};