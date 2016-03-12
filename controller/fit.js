/*
 * 智能设备 misfit的传送数据
 * 作者：龙仕云  2016-3-11
 *
 */

var express = require('express');
var db = require('../db');
var misfit = require('node-misfit');


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
  var startdate = req.query.startdate;
  var enddate = req.query.enddate;
  
  if(!code){
    res.json({success:false,msg:'无法获取misfit的code'})
    return false;
  };
  
  //要取出token值
  misfitHandler.getAccessToken(code, function(err, token){
    if(!err && token){
      
        //1.取出汇总信息
        misfitHandler.getGoals(token,startdate,enddate,function(err,goals){
          
          console.log(goals);      
          
          
          //2.取出明细
          misfitHandler.getSummary(token,startdate,enddate,{detail: true}, function(err, summary){
          
            console.log(summary);
              
            //3.取出睡眠信息   
            misfitHandler.getSleeps(user.accessToken, '2013-11-05', '2013-11-08', function(err, sleeps){
              console.log(sleeps);
            });
            
          });
          
          
        });
                
       
    }
    else{
      res.msgBox('读取misfit的token出错。',true);
      
    };
  });
};

router.use('/data',use_data)

module.exports = router;