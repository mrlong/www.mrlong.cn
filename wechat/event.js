///////////////////////////////////////////////////////////////////////////////
//
// 作者：龙仕云  2014－3－18
//
// 事件
//
///////////////////////////////////////////////////////////////////////////////

// message为事件内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'event',
  // Event: 'LOCATION',
  // Latitude: '23.137466',
  // Longitude: '113.352425',
  // Precision: '119.385040',
  // MsgId: '5837397520665436492' }


module.exports = function(event, req, res, next){
	console.log(event);
  if (event.Event === 'subscribe') {
  	res.reply('这不是你关注的，请取消关注');
    
  } else if (event.Event === 'unsubscribe') {
    res.reply('Bye! 谢谢你的关注下次再来。');
  } else if (event.Event =='CLICK'){
    if(event.EventKey=='V1001_TODAY_MUSIC'){
      res.reply('你好，我是你的专门客服龙仕云。');
    }
    else{
      res.reply('不要随意的点，现在还不支持。');
    }
  }
  else {
  	res.reply('暂未支持! Coming soon!-1');
  }
};
