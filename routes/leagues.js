module.exports = function(ctx) {
	
	var MAX_READ = 20;
	
	var queryEvents = function(res, model, leagueId) {
		query = {};
		model.find(query, MAX_READ, function(err, leagues) {
			if (err) throw err;
			res.send(leagues);
		});
	};
	
	ctx.app.get("/leagues", function(req, res) {
		queryEvents(res, req.models.league, req.params.leagueId);
	});
	
	ctx.app.post("/admin/leagues/insert/:leagueName", ctx.auth, function(req, res) {
		league = {};
		league.league_name = req.params.leagueName;
		req.models.league.create(league, function(err, items) {
			if (err) throw err;
			res.send(items);
		});
	});
	
};
