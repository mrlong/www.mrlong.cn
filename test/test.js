

var down = require('../wechat/downloadfile');

var PicUrl = 'http://mmbiz.qpic.cn/mmbiz/lMHkuTribIDj0aELcdFUV1bFWWQIAAFXFrBibv41sG9vnYibmZacpkcbD8a1H2kgib3Y1BXE8tQNgUJy8t7fSpOvEg/0';
down(PicUrl,function(err,msg){
	console.log(msg);
});


var dbthis = this;
  
  async.series({
    one:function(callback){
      //有可能会重复，则要删除掉原来的。
      if(mycontguid){
        dbthis.query('select * from location where loc_style=? and loc_content=?',[style,mycontguid],function(err,rows){
          if(rows.length>0){
            myoldguid = rows[0].loc_guid;    //todo:如这地方没有执行完成，就要到下面删除了怎么办，会异步的情况了？？？
            callback(null,myoldguid);
          }
      })};
    },
    tow:function(callback){
      var zguid = this.newGuid();
      dbthis.exec('insert into location(loc_guid,loc_style,loc_latitude,loc_longitude,loc_content)' +
       'values(?,?,?,?,?)',[zguid,style,lat,lng,mycontguid],function(err){
          callback(err,zguid);
        });
    }},
    function(err, results){
      if(!err && results.one){
        dbthis.exec('delete from location where loc_guid=?',[results.one]);
      };
      if(myfn){myfn(err,results.tow)};
      
  });
  