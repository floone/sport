Date.prototype.toMysqlDate = function() {
	return this.toISOString().slice(0, 19).replace('T', ' ')
};

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
			models.league = db.define('league', {
				leaguename: { required: true, type: "text" },
				table:      { required: false, type: "object" }
			});
			models.post = db.define('post', {
				username:          { required: true, type: "text", size: 15 },
				text:              { required: true, type: "text" },
				fetched_at:        { required: true, type: "date", time: true },
				created_at:        { required: true, type: "date", time: true },
				original_id_str:   { required: true, type: "text", size: 21 },
				profile_image_url: { required: false, type: "text" },
				media_url:         { required: false, type: "text" }
			});
			models.event = db.define('event', {
				teama:       { required: true, type: "text", size: 3 },
				teamb:       { required: true, type: "text", size: 3 },
				datetime:    { required: true, type: "date", time: true },
				tags:        { required: false, type: "text" },
				info:        { required: false, type: "text" },
				refresh_url: { required: false, type: "text" }
			});
			models.event.hasOne('league', models.league, { required: true });
			models.post.hasOne('event', models.event, { required: true });
			db.sync(function(err) {
				if (err) throw err;
			});
		}
	}));
	
}