/*
 * 智能设备 misfit的传送数据
 * 作者：龙仕云  2016-3-11
 *
 */

var express = require('express');
var db = require('../db');
var markdown = require('markdown').markdown;


var router = express.Router();



router.use('/',function(req,res,next){
  
  console.log(req.body);
  console.log(req.params);
  console.log(req.query);
  console.log(req.headers);
  
  res.status(200).end('ok');
  
});

module.exports = router;