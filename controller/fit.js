/*
 * 智能设备 misfit的传送数据
 * 作者：龙仕云  2016-3-11
 *
 */

var express = require('express');
var db = require('../db');
var misfit = require('node-misfit');
var EventProxy = require('eventproxy');


var router = express.Router();



router.use('/',function(req,res,next){
  
  var startdate = req.query.startdate;
  var enddate = req.query.enddate;
  
  
  var config = {
    clientId:'pYPABsuKSXpOByXr',
    clientSecret:'bSImVLktCHSZEVnFWiSyjtzKwGgeQcqp',
    redirectUri:'http://www.mrlong.cn/fit/data?startdate=' +  startdate +'&enddate=' + enddate
  };

  var misfitHandler = new misfit({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri
  });

  var authorizeUrl = misfitHandler.getAuthorizeUrl();
  
  res.redirect(authorizeUrl); //重新转向
  
});


var use_data = function(req,res,next){
  
  var code = req.query.code;
  var view = req.query.view; //=1 有示是wechat显示，=2为网页显示。
  var startdate = req.query.startdate;
  var enddate = req.query.enddate;
  
  var ep = new EventProxy();
  
  if(!code){
    res.json({success:false,msg:'无法获取misfit的code'})
    return false;
  };
  
  ep.all(['goals','summary','sleeps'],function(goals,summary,sleeps){
    
    if(!goals || !summary || !sleeps){
      res.msgBox('读取misfit的token出错。',view=='1');
      return false;  
    };
    
    console.log(goals); 
    console.log(summary);
    console.log(sleeps);
    
    res.loadview('fit_index.html',{goals:goals,summary:summary,sleeps:sleeps},view=='1');
    
  });
  
  
  //要取出token值
  misfitHandler.getAccessToken(code, function(err, token){
    if(!err && token){
      
      //1.取出汇总信息
      misfitHandler.getGoals(token,startdate,enddate,function(err,goals){
        ep.emit('goals',!err ? goals : null );  
      });

     //2.取出明细
      misfitHandler.getSummary(token,startdate,enddate,{detail: true}, function(err, summary){
        ep.emit('summary',!err ? summary : null);
      });

      //3.取出睡眠信息
      misfitHandler.getSleeps(user.accessToken, '2013-11-05', '2013-11-08', function(err, sleeps){
        ep.emit('sleeps',!err ? sleeps : null );
      });
                          
    }
    else{
      ep.emit('goals',null);
      ep.emit('summary',null);
      ep.emit('sleeps',null);    
    };
  });
};

router.use('/data',use_data)

module.exports = router;