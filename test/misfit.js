var misfit = require('node-misfit');

var config = {
  clientId:'pYPABsuKSXpOByXr',
  clientSecret:'bSImVLktCHSZEVnFWiSyjtzKwGgeQcqp',
  redirectUri:'http://www.mrlong.cn/misfit?sdate=234&edate=eeee'
  
}

var misfitHandler = new misfit({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri
});

var authorizeUrl = misfitHandler.getAuthorizeUrl('token');

console.log(authorizeUrl);
//
misfitHandler.getAccessToken('m9mjoaWvESJigjoz', function(err, token){
    console.log(token); // -> 'afwfh384hg84uh348g34g8374hga874gh8a374gha8347gha8347'
  
  misfitHandler.getProfile(token, function(err, profile) {
    console.log(profile);
    console.log(err);
})
  
//  console.log(err);
});


