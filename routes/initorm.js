module.exports = function(ctx) {
	var orm = require('orm');
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
}
