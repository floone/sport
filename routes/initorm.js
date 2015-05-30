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
			pool: true,
			debug: false
		}
	};
	ctx.app.use(orm.express(opts, {
		define: function(db, models) {
			models.post = db.define('post', {
				username:   { required: true, type: "text", size: 15 },
				text:       { required: true, type: "text" },
				created_at: { required: true, type: "date", time: true },
				media_url:  { required: false, type: "text" }
			});
			models.event = db.define('event', {
				teama: { required: true, type: "text", size: 3 },
				teamb: { required: true, type: "text", size: 3 },
				date:  { required: true, type: "date", time: true },
				tags:  { required: false, type: "text" }
			});
			db.sync(function(err) {
				if (err) throw err;
			});
		}
	}));
}
