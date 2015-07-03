Date.prototype.toMysqlDate = function() {
	return this.toISOString().slice(0, 19).replace('T', ' ');
};

module.exports = function(ctx) {
	
	var orm = require('orm');
	
	var opts = {
		database: 'sport',
		protocol: 'mysql',
		host: process.env.OPENSHIFT_MYSQL_DB_HOST || "127.0.0.1",
		port: process.env.OPENSHIFT_MYSQL_DB_PORT || 3306,
		user: process.env.MYSQL_USERNAME || 'root',
		password: process.env.MYSQL_PASSWORD || '',
		charset: 'utf8mb4',
		query: {
			pool: true,
			debug: false
		}
	};
	
	var listConstraints = function(db, referencedTable) {
		var stmt = "select " +
		"TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME " +
		"from INFORMATION_SCHEMA.KEY_COLUMN_USAGE where REFERENCED_TABLE_NAME = '" +
		referencedTable + "'";
		db.driver.execQuery(stmt, function (err, data) {
			if (err) throw err;
			var r = data[0];
			var constraint = r.CONSTRAINT_NAME + ': ' +
			r.TABLE_NAME + '.' + r.COLUMN_NAME + ' -> ' +
			r.REFERENCED_TABLE_NAME + '.' + r.REFERENCED_COLUMN_NAME;
			ctx.info(constraint);
		});
	};
	
	var createForeignKeys = function(db) {
		
		var statements = [];
		
		statements.push('ALTER TABLE event ADD CONSTRAINT FK_league_id FOREIGN KEY ' +
		'(league_id) REFERENCES league(id) ON UPDATE CASCADE ON DELETE RESTRICT;');
		
		statements.push('ALTER TABLE event ADD CONSTRAINT UX_teams_leage_round ' +
		'UNIQUE (teama, teamb, league_id, round);');

		statements.push('ALTER TABLE post ADD CONSTRAINT FK_event_id FOREIGN KEY ' +
		'(event_id) REFERENCES event(id) ON UPDATE CASCADE ON DELETE RESTRICT;');
		
		statements.forEach(function(statement) {
			db.driver.execQuery(statement, function (err, data) {
				if (err) {
					if (String(err).indexOf('duplicate key') > -1) {
						ctx.info('Foreign key already exists. Statement: ' + statement);
					}
					else {
						throw err;
					}
				}
				else {
					ctx.info('Created index: ' + statement);
				}
			});
		});
	};
	
	ctx.app.use(orm.express(opts, {
		define: function(db, models) {
			models.league = db.define('league', {
				league_name: { required: true, type: "text" },
				table:       { required: false, type: "object" }
			});
			models.event = db.define('event', {
				teama:       { required: true, type: "text", size: 3 },
				teamb:       { required: true, type: "text", size: 3 },
				datetime:    { required: true, type: "date", time: true },
				round:       { required: true, type: "integer" },
				tags:        { required: false, type: "text" },
				info:        { required: false, type: "text" },
				refresh_url: { required: false, type: "text" }
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
			models.team = db.define('team', {
				team_name:        { required: true, type: "text" },
				team_name_short:  { required: true, type: "text" },
				common_tags:      { required: false, type: "object" }
			});
			models.event.hasOne('league', models.league, { required: true });
			models.post.hasOne('event', models.event, { required: true });
			
			db.driver.execQuery("select count(id) from post", function (err, data) {
				if (err) {
					ctx.info("Did not find post table, trying to initialize...");
					db.sync(function(err) {
						if (err) throw err;
						createForeignKeys(db);
					});
				}
				else {
					ctx.info("Database already initialized -- manually delete tables to force initialization");
					listConstraints(db, 'league');
					listConstraints(db, 'event');
				}
			});
			
		}
	}));
	
};
