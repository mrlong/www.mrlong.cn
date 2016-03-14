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
  
  var misfitHandler = new misfit({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri
  });

  var authorizeUrl = misfitHandler.getAuthorizeUrl();  
  res.loadview('showfit.html',{code:code,authorizeUrl:authorizeUrl});
  
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
  
  ep.all(['goals','summary','sleeps','sessions'],function(goals,summary,sleeps,sessions){
    
    if(!goals || !summary || !sleeps || !sessions){
      res.msgBox('读取misfit的token出错。',view=='1');
      return false;  
    };
    
    if(goals.length != summary.length){
      res.msgBox('结构数据出错。');
      return false;
    }
    
    //写入库内
    
    console.log(goals); 
    console.log(summary);
    console.log(sleeps);
    console.log(sessions);
    
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
          res.loadview('showfit.html',{code:null,goals:goals,summary:summary,sleeps:sleeps,authorizeUrl:authorizeUrl});
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
        ep.emit('goals',!err && goals ? goals.goals : null );  
      });

     //2.取出结果
      misfitHandler.getSummary(token,startdate,enddate,{detail: true}, function(err, summary){
        
        ep.emit('summary',!err && summary ? summary.summary : null);
      });

      //3.取出睡眠信息
      misfitHandler.getSleeps(token,startdate,enddate, function(err, sleeps){
        ep.emit('sleeps',!err && sleeps ? sleeps.sleeps : null );
      });
      
      //4.取出明细
      misfitHandler.getSessions(token, startdate, enddate, function(err, sessions){
        ep.emit('sessions',!err && sessions ? sessions.sessions : null );  
      });
      
                          
    }
    else{
      ep.emit('goals',null);
      ep.emit('summary',null);
      ep.emit('sleeps',null); 
      ep.emit('sessions',null);
    };
  });
};



router.post('/data',post_fitdata);
router.get('/',get_fitindex);

module.exports = router;