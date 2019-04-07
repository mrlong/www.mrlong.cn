/*
 * 智能设备 misfit的传送数据
 * 作者：龙仕云  2016-3-11
 *
 */

var express = require('express');
var db = require('../db');
var misfit = require('node-misfit');
var EventProxy = require('eventproxy');
var config = require('../config.js');


var router = express.Router();

var config = config.misfit;

var get_fitindex = function(req,res,next){
  
  
  var code = req.query.code;
  var page = req.query.page||1;
  var startpage = (page-1)*20;
  var ep = new EventProxy();
  
  var misfitHandler = new misfit({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri /*在这个地方可以直接加入时间的区间*/
  });

  ep.all(['record','summry'],function(record,summry){
    var authorizeUrl = misfitHandler.getAuthorizeUrl();  
    res.loadview('showfit.html',{
      code:code,
      authorizeUrl:authorizeUrl,
      curpage:page,
      total_steps:summry ? summry.total_steps : 0,
      rowcount:summry ? summry.rowcount : 0,
      total_sleeplong:summry ? summry.total_sleeplong : 0,
      total_fit_distance:summry ? summry.total_fit_distance : 0,
      rows:record});
  });
  
  
  
  db.query('select * from fit order by fit_date desc limit ?,20',
           [startpage],function(err,rows,db){
    db.get('select count(*) as rowcount,sum(fit_steps) as total_steps, sum(fit_sleep_duration) as total_sleeplong,sum(fit_distance) as total_fit_distance from fit',function(err,row){
      ep.emit('summry', !err ? {rowcount:row.rowcount,total_steps:row.total_steps,total_sleeplong:row.total_sleeplong,total_fit_distance:row.total_fit_distance} : null);  
    });
    ep.emit('record',!err && rows ? rows : []);  
  });
    
  
};

//写运动明细数据
var writesessiondb = function(sessions,idx,fitdate,cb){
  var myitem = sessions[idx];
  if(!myitem){
    if(cb) cb(null);
    return false;    
  };
  
  db.exec('insert into fititems(fie_guid,fit_date,fie_activitytype,fie_startTime,fie_duration,fie_points,fie_steps,fie_calories,fie_distance) values(?,?,?,?,?,?,?,?,?)',
          [db.newGuid(),fitdate,myitem.activityType,myitem.startTime,myitem.duration,myitem.points,myitem.steps,myitem.calories,myitem.distance],function(err){
    if(!err && sessions.length > (idx+1)){
      writesessiondb(sessions,idx+1,fitdate,cb);  
    } 
    else{
      if(cb) cb(err);
    }
  });
};


var writetodb = function(fitdata,idx,cb){
  var mygoals = fitdata[idx].goals;
  var mysummary = fitdata[idx].summary;
  var mysleeps = fitdata[idx].sleeps;
  var mysessions = fitdata[idx].sessions;
  
  var sleep_autoDetected = mysleeps && mysleeps.autoDetected;
  var sleep_startTime = mysleeps && mysleeps.startTime;
  var sleep_duration = mysleeps && mysleeps.duration;
      
      
  db.exec( 'delete from fit where fit_date="'+ mygoals.date +'";insert into fit(fit_date,fit_points,fit_targetPoints,fit_steps,fit_calories,fit_activityCalories,fit_distance,fit_sleep_autoDetected,fit_sleep_startTime,fit_sleep_duration) values(?,?,?,?,?,?,?,?,?,?) ',
          [[],[mygoals.date,mygoals.points,mygoals.targetPoints,mysummary.steps,mysummary.calories,mysummary.activityCalories,mysummary.distance,sleep_autoDetected,sleep_startTime,sleep_duration]],function(err){
    if(!err){
      
      //写明细
      db.exec('delete from fititems where fit_date="' + mygoals.date + '";' +
              'delete from fitsleepitem where fit_date="' + mygoals.date + '"',function(err){
        writesessiondb(mysessions,0,mygoals.date,function(err){
          if(!err){
            if(!err && fitdata.length > (idx+1)){
                writetodb(fitdata,idx+1,cb);  
            }  
            else{
              if(cb) cb(err);  
            };
          } 
          else{
            if(cb) cb(err);  
          }
        });  
      });
    }
    else {
      if(cb) cb(err);
    }
  }); 
};

//
//这个是从misfit内取出数据来
//
var post_fitdata = function(req,res,next){
  
  var code = req.body.code;
  var view = req.query.view; //=1 有示是wechat显示，=2为网页显示。
  var startdate = req.body.startdate;
  var authorizeUrl = req.body.authorizeUrl;
  var enddate = req.body.enddate;
  
  var ep = new EventProxy();
  
  if(!code){
    res.msgBox('无法获取misfit的code');
    return false;
  };
  
  var misfitHandler = new misfit({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri
  });
  
  ep.all(['goals','summary','sleeps','sessions','err'],function(goals,summary,sleeps,sessions,err){
    
    if(!goals || !summary || !sleeps || !sessions){
      res.msgBox('读取misfit的token出错。'+err.toString() + '==内容==\r\n' + 
                  (goals   ? goals.toString() :'') +
                  (summary ? summary.toString():'') +
                  (sleeps  ? sleeps.toString():'') +
                  (sessions ? sessions.toString():'')  
                 ,view=='1');
      return false;  
    };
    
    if(goals.length != summary.length){
      res.msgBox('结构数据出错。');
      return false;
    }
    
    //写入库内
    
//    console.log(goals); 
//    console.log(summary);
//    console.log(sleeps);
//    console.log(sessions);
    
    var fitdata=[];
    for(var i=0; i<goals.length;i++){
      //分日期处理
      var myitems = [];
      for(var j=0 ; j< sessions.length;j++){
        var d = new Date(sessions[j].startTime);
        if (d.toLocaleDateString().replace(/\//g,'-') == goals[i].date){
          myitems.push(sessions[j]);
        };
      };
      fitdata.push({goals:goals[i],summary:summary[i],sleeps:sleeps[i],sessions:myitems});
    };
    
      
    if(fitdata.length>0){
      writetodb(fitdata,0,function(err){
        if(!err){
          //res.loadview('showfit.html',{code:null,goals:goals,summary:summary,sleeps:sleeps,authorizeUrl:authorizeUrl});
          get_fitindex(req,res,next);
        }
        else{
          res.msgBox('将msifit值写入库内出错。'+err,view=='1');
        }
      });
    }; 
           
  });
  
  
  //要取出token值
  misfitHandler.getAccessToken(code, function(err, token){
    if(!err && token){
      
      //1.取出目标
      misfitHandler.getGoals(token,startdate,enddate,function(err,goals){
        
        if(!err){
          ep.emit('goals',!err && goals ? goals.goals : null );
        }
        else{
          ep.emit('goals',null);
          ep.emit('err',err);  
        }
        
        //2.取出结果
        misfitHandler.getSummary(token,startdate,enddate,{detail: true}, function(err, summary){
          if(!err){
            ep.emit('summary',!err && summary ? summary.summary : null); 
          }
          else{
            ep.emit('summary',null);
            ep.emit('err',err); 
          }
        });
        
         //3.取出睡眠信息
         misfitHandler.getSleeps(token,startdate,enddate, function(err, sleeps){
            if(!err){
              ep.emit('sleeps',!err && sleeps ? sleeps.sleeps : null );      
            }
            else{
              ep.emit('sleeps',null); 
              ep.emit('err',err); 
              }
          });
        
                
         //4.取出明细
          misfitHandler.getSessions(token, startdate, enddate, function(err, sessions){
            if(!err){
              ep.emit('sessions',!err && sessions ? sessions.sessions : null ); 
              ep.emit('err',null);
            }
            else{
              ep.emit('sessions',null);
              ep.emit('err',err);  
            }
          });
        
        
        
      });
                          
    }
    else{
      ep.emit('goals',null);
      ep.emit('summary',null);
      ep.emit('sleeps',null); 
      ep.emit('sessions',null);
      ep.emit('err',err);
    };
  });
};


/*
 * 健身房
 */
var get_addhouse = function(req,res,next){
  var loc_guid = req.query.loc_guid;
  res.loadview('fithouse_add.html',{loc_guid:loc_guid},true);
};

var post_addhouse = function(req,res,next){
  var loc_guid = req.body.loc_guid;
  var fih_style    = parseInt(req.body.fih_style || '1');
  var fih_longtime = parseInt(req.body.fih_longtime || '0');

  fih_group_type1 = parseInt(req.body.fih_group_type1 || '0');
  fih_group_num1 = parseInt(req.body.fih_group_num1 || '1');
  fih_group_count1 = parseInt(req.body.fih_group_count1 || '1');
  fih_group_calories1 = parseFloat(req.body.fih_group_calories1 || '0');

  fih_group_type2 = parseInt(req.body.fih_group_type2 || '0');
  fih_group_num2 = parseInt(req.body.fih_group_num2 || '1');
  fih_group_count2 = parseInt(req.body.fih_group_count2 || '1');
  fih_group_calories2 = parseFloat(req.body.fih_group_calories2 || '0');

  fih_group_type3 = parseInt(req.body.fih_group_type3 || '0');
  fih_group_num3 = parseInt(req.body.fih_group_num3 || '1');
  fih_group_count3 = parseInt(req.body.fih_group_count3 || '1');
  fih_group_calories3 = parseFloat(req.body.fih_group_calories3 || '0');

  fih_group_type4 = parseInt(req.body.fih_group_type4 || '0');
  fih_group_num4 = parseInt(req.body.fih_group_num4 || '1');
  fih_group_count4 = parseInt(req.body.fih_group_count4 || '1');
  fih_group_calories4 = parseFloat(req.body.fih_group_calories4 || '0');

  fih_group_type5 = parseInt(req.body.fih_group_type5 || '0');
  fih_group_num5 = parseInt(req.body.fih_group_num5 || '1');
  fih_group_count5 = parseInt(req.body.fih_group_count5 || '1');
  fih_group_calories5 = parseFloat(req.body.fih_group_calories5 || '0');

  fih_group_type6 = parseInt(req.body.fih_group_type6 || '0');
  fih_group_num6 = parseInt(req.body.fih_group_num6 || '1');
  fih_group_count6 = parseInt(req.body.fih_group_count6 || '1');
  fih_group_calories6 = parseFloat(req.body.fih_group_calories6 || '0');

  fih_group_type7 = parseInt(req.body.fih_group_type7 || '0');
  fih_group_num7 = parseInt(req.body.fih_group_num7 || '1');
  fih_group_count7 = parseInt(req.body.fih_group_count7 || '1');
  fih_group_calories7 = parseFloat(req.body.fih_group_calories7 || '0');

  fih_group_type8 = parseInt(req.body.fih_group_type8 || '0');
  fih_group_num8 = parseInt(req.body.fih_group_num8 || '1');
  fih_group_count8 = parseInt(req.body.fih_group_count8 || '1');
  fih_group_calories8 = parseFloat(req.body.fih_group_calories8 || '0');
  
  fih_remark = req.body.fih_remark;
  var zguid = db.newGuid();

  db.exec('insert into fithouse(fih_guid,fih_longtime,loc_guid,fih_style,fih_group_type1,fih_group_num1,fih_group_count1,fih_group_calories1,fih_group_type2,fih_group_num2,fih_group_count2,fih_group_calories2,fih_group_type3,fih_group_num3,fih_group_count3,fih_group_calories3,fih_group_type4,fih_group_num4,fih_group_count4,fih_group_calories4,fih_group_type5,fih_group_num5,fih_group_count5,fih_group_calories5,fih_group_type6,fih_group_num6,fih_group_count6,fih_group_calories6,fih_group_type7,fih_group_num7,fih_group_count7,fih_group_calories7,fih_group_type8,fih_group_num8,fih_group_count8,fih_group_calories8,fih_remark ) '+
            'values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          [zguid,fih_longtime,loc_guid,fih_style,fih_group_type1,fih_group_num1,fih_group_count1,fih_group_calories1,fih_group_type2,fih_group_num2,fih_group_count2,fih_group_calories2,fih_group_type3,fih_group_num3,fih_group_count3,fih_group_calories3,fih_group_type4,fih_group_num4,fih_group_count4,fih_group_calories4,fih_group_type5,fih_group_num5,fih_group_count5,fih_group_calories5,fih_group_type6,fih_group_num6,fih_group_count6,fih_group_calories6,fih_group_type7,fih_group_num7,fih_group_count7,fih_group_calories7,fih_group_type8,fih_group_num8,fih_group_count8,fih_group_calories8,fih_remark],function(err,indb){
    
    if(!err && loc_guid != ''){
      indb.run('update location set loc_style=5,loc_content=? where loc_guid=?',[zguid,loc_guid]);      
    };

    res.msgBox(!err?'保存成功':'保存出错'+err,true);
  
    }); 
};




router.post('/data',post_fitdata);
router.get('/addhouse',get_addhouse);
router.post('/addhouse',post_addhouse);

router.get('/',get_fitindex);


module.exports = router;