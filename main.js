var express = require('express');
var requireFu = require('require-fu');

var ctx = {};
ctx.app = express();

ctx.error = function(s, res, t) {
	if (res && t) {
		res.send(t);
	}
	throw new Date() + ' ERROR: ' + s; 
}
ctx.info  = function(s) { console.log(new Date() + ' INFO: ' + s); }
ctx.debug = function(s) { console.log(new Date() + ' DEBUG: ' + s); }

requireFu(__dirname + '/routes')(ctx);

ctx.app.get('/', function (req, res) {
  res.send('Hello World!');
});

var ipaddress = process.env.OPENSHIFT_NODEJS_IP   || "127.0.0.1"
var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server = ctx.app.listen(port, ipaddress, function () {
	console.log('Listening at http://%s:%s', server.address().address, server.address().port);
});