module.exports = function(ctx) {
	
	var orm = require('orm');
	
	var MAX_READ = 20;
	
	var queryPosts = function(res, postsModel, eventId, sinceId) {
		query = {};
		if (eventId) {
			if (isNaN(eventId)) ctx.error('eventId must be numeric', res, []);
			query.event_id = eventId;
		}
		if (sinceId) {
			if (isNaN(sinceId)) ctx.error('sinceId must be numeric', res, []);
			query.id = orm.gt(sinceId);
		}
		postsModel.find(query, MAX_READ, function(err, posts) {
			if (err) throw err;
			res.send(posts);
		});
	}
	
	ctx.app.get("/posts", function(req, res) {
		queryPosts(res, req.models.post, null, null);
	});
	
	ctx.app.get("/posts/:eventId", function(req, res) {
		queryPosts(res, req.models.post, req.params.eventId, null);
	});
	
	ctx.app.get("/posts/:eventId/since/:sinceId", function(req, res) {
		queryPosts(res, req.models.post, req.params.eventId, req.params.sinceId);
	});
	
}
