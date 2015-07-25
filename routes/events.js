module.exports = function(ctx) {
	
	var MAX_READ = 20;
	
	var queryEvents = function(res, model, leagueId, round) {
		query = {};
		if (isNaN(leagueId)) ctx.error('leagueId must be numeric', res, []);
		query.league_id = leagueId;
		
		if (round) {
			query.round = round;
			model.find(query, MAX_READ, function(err, events) {
				if (err) throw err;
				res.send(events);
			});
		}
		else {
			model.aggregate(query).max("round").get(function(err, maxRound) {
				if (err) throw err;
				query.round = maxRound;
				model.find(query, MAX_READ, function(err, events) {
					if (err) throw err;
					var toType = function(obj) {
						return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
					}
					events.forEach(function(ev) {
						console.log(toType(ev.datetime));
						console.log(ev.datetime);
						console.log(ev.datetime.toISOString());
					});
					res.send(events);
				});
			});
		}
		
	};
	
	ctx.app.get("/events/:leagueId", function(req, res) {
		queryEvents(res, req.models.event, req.params.leagueId, null);
	});
	
	ctx.app.get("/events/:leagueId/:round", function(req, res) {
		queryEvents(res, req.models.event, req.params.leagueId, req.params.round);
	});
	
};
