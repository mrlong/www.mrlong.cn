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
  console.log('code='+code);
  misfitHandler.getAccessToken(code, function(err, token){
    if(!err && token){
      
      //1.取出目标
      misfitHandler.getGoals(token,startdate,enddate,function(err,goals){
        
        if(!err){
          ep.emit('goals',!err && goals ? goals.goals : null );
          //2.取出结果
          misfitHandler.getSummary(token,startdate,enddate,{detail: true}, function(err, summary){
            if(!err){
              ep.emit('summary',!err && summary ? summary.summary : null);
              
              //3.取出睡眠信息
              misfitHandler.getSleeps(token,startdate,enddate, function(err, sleeps){
                if(!err){
                  ep.emit('sleeps',!err && sleeps ? sleeps.sleeps : null );
                  
                  //4.取出明细
                  misfitHandler.getSessions(token, startdate, enddate, function(err, sessions){
                    if(!err){
                      ep.emit('sessions',!err && sessions ? sessions.sessions : null ); 
                    }
                    else{
                      ep.emit('sessions',null);
                      ep.emit('err',err);  
                      console.log(err+'sssss-5');
                    }
                  });
                  
                }
                else{
                  ep.emit('sleeps',null); 
                  ep.emit('sessions',null);
                  ep.emit('err',err); 
                  console.log(err+'sssss-4');
                }
              });
              
            }
            else{
              ep.emit('summary',null);
              ep.emit('sleeps',null); 
              ep.emit('sessions',null);
              ep.emit('err',err); 
              console.log(err+'sssss-3');
            }
          });
          
        }
        else{
          ep.emit('goals',null);
          ep.emit('summary',null);
          ep.emit('sleeps',null); 
          ep.emit('sessions',null);
          ep.emit('err',err);  
          console.log(err+'sssss-2');
        }
        
        
      });

     

      
      
      
      
      
      
                          
    }
    else{
      ep.emit('goals',null);
      ep.emit('summary',null);
      ep.emit('sleeps',null); 
      ep.emit('sessions',null);
      ep.emit('err',err);
      console.log(err+'sssss-1');
    };
  });
};

var endpoint = function(req,res,next){
  
  console.log('msn - misfit');
  res.end();
};



router.post('/data',post_fitdata);
router.get('/',get_fitindex);
router.get('/endpoint',endpoint);

module.exports = router;