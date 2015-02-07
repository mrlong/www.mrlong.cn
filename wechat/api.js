var API = require('./api_common');
// js sdk接口
API.mixin(require('./api_js'));

//二维码接口
API.mixin(require('./api_qrcode.js'));


module.exports = API;
