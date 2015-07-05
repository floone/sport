module.exports = function(ctx) {
	
	var MAX_READ = 20;
	
	var queryEvents = function(res, model, leagueId) {
		query = {};
		if (isNaN(leagueId)) ctx.error('leagueId must be numeric', res, []);
		query.league_id = leagueId;
		model.find(query, MAX_READ, function(err, events) {
			if (err) throw err;
			res.send(events);
		});
	};
	
	ctx.app.get("/events/:leagueId", function(req, res) {
		queryEvents(res, req.models.event, req.params.leagueId);
	});

};
