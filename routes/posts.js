module.exports = function(ctx) {
	
	var orm = require('orm');
	
	var MAX_READ = 50;
	
	var queryPosts = function(res, postModel, eventModel, eventId, sinceId) {
		query = {};
		if (eventId) {
			if (isNaN(eventId)) ctx.error('eventId must be numeric', res, []);
			query.event_id = eventId;
		}
		if (sinceId) {
			if (isNaN(sinceId)) ctx.error('sinceId must be numeric', res, []);
			query.id = orm.gt(sinceId);
		}
		eventModel.get(eventId, function(err, eventData) {
			if (err) throw err;
			postModel.find(query, MAX_READ, ['created_at', 'Z'], function(err, posts) {
				if (err) throw err;
				var container = {};
				container.posts = posts;
				container.eventData = eventData;
				res.send(container);
			});
		});
	};
	
	ctx.app.get("/posts", function(req, res) {
		queryPosts(res, req.models.post, req.models.event, null, null);
	});
	
	ctx.app.get("/posts/:eventId", function(req, res) {
		queryPosts(res, req.models.post, req.models.event, req.params.eventId, null);
	});
	
	ctx.app.get("/posts/:eventId/since/:sinceId", function(req, res) {
		queryPosts(res, req.models.post, req.models.event, req.params.eventId, req.params.sinceId);
	});
	
};
