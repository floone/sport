var express = require('express');
var requireFu = require('require-fu');

var ctx = {};
ctx.app = express();

var isonow = function() { return new Date().toISOString(); }
ctx.error = function(s, res, t) {
	if (res && t) {
		res.send(t);
	}
	throw isonow() + ' ERROR ' + s; 
}
ctx.info = function(s) { console.info(isonow() + ' INFO  ' + s); }
ctx.debug = function(s) { console.log(isonow() + ' DEBUG ' + s); }

ctx.app.set('json replacer', function replacer(key, value) {
	if (key === 'event_id') return undefined;
	if (key === 'fetched_at') return undefined;
	if (key === 'original_id_str') return undefined;
	return value;
});

requireFu(__dirname + '/routes')(ctx);

var ipaddress = process.env.OPENSHIFT_NODEJS_IP   || "127.0.0.1"
var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server = ctx.app.listen(port, ipaddress, function () {
	ctx.info('Listening at http://' + server.address().address + ':' + server.address().port);
});