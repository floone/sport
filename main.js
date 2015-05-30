var express = require('express');
var requireFu = require('require-fu');
var mysqldb = require('./lib/mysqldb');
var orm = require('orm');

var ctx = {};
ctx.app = express();
//ctx.pool = mysqldb.createConnectionPool();
//ctx.pool.getConnection(function(err, conn) { if (err) throw err; });

var opts = {
	database: 'sport',
	protocol: 'mysql',
	host: process.env.OPENSHIFT_MYSQL_DB_HOST || "127.0.0.1",
	port: process.env.OPENSHIFT_MYSQL_DB_PORT || 3306,
	user: 'adminm9YzrXI',
	password: '3mfbsClKVgyw',
	query: {
		pool: true
	}
};

ctx.app.use(orm.express(opts, {
	define: function(db, models) {
		models.post = db.define('post', {
			title: String
		});
		models.post.sync(function(err) {
			if (err) throw err;
		});
	}
}));

requireFu(__dirname + '/routes')(ctx);

ctx.app.get('/posts', function (req, res) {
	req.models.post.find({}, function(err, posts) {
		if (err) throw err;
		res.send(posts);
	});
});

ctx.app.get('/', function (req, res) {
  res.send('Hello World!');
});

var ipaddress = process.env.OPENSHIFT_NODEJS_IP   || "127.0.0.1"
var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server = ctx.app.listen(port, ipaddress, function () {
	console.log('Listening at http://%s:%s', server.address().address, server.address().port);
});

