module.exports = function(ctx) {
	var orm = require('orm');
	var opts = {
		database: 'sport',
		protocol: 'mysql',
		host: process.env.OPENSHIFT_MYSQL_DB_HOST || "127.0.0.1",
		port: process.env.OPENSHIFT_MYSQL_DB_PORT || 3306,
		user: 'adminm9YzrXI',
		password: '3mfbsClKVgyw',
		charset: 'utf8mb4',
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
				teama:       { required: true, type: "text", size: 3 },
				teamb:       { required: true, type: "text", size: 3 },
				datetime:    { required: true, type: "date", time: true },
				tags:        { required: false, type: "text" },
				refresh_url: { required: false, type: "text" }
			});
			db.sync(function(err) {
				if (err) throw err;
				/*
				models.event.create({
					teama: 'WOB',
					teamb: 'BVB',
					datetime: '2015-05-31 16:00:00'
				}, function(err, items) {
					if (err) throw err;
				});
				*/
				/*
				models.post.create([ { 
					username: 'E. Figgemeier',
					text: 'De Bruyne eindeutig der bessere Reus heute. 😝 #BVBWOB',
					//created_at: 'FROM_UNIXTIME(1433012008)',
					created_at: '2012-12-31 11:30:45',
					media_url: null
				} ], function(err, items) {
					if (err) throw err;
				});
				*/
			});
		}
	}));
}
