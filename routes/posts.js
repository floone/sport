var MAX_READ = 20;
var orm = require('orm');

module.exports = function(ctx) {
	
	ctx.app.get("/posts", function(req, res) {
		req.models.post.find({}, MAX_READ, function(err, posts) {
			if (err) throw err;
			res.send(posts);
		});
	});
	
	ctx.app.get("/posts/:eventId", function(req, res) {
		if (isNaN(req.params.eventId)) ctx.error('eventId must be numeric', res, []);
		req.models.post.find({ event_id: req.params.eventId }, MAX_READ, function(err, posts) {
			if (err) throw err;
			res.send(posts);
		});
	});
	
	ctx.app.get("/posts/:eventId/since/:sinceId", function(req, res) {
		if (isNaN(req.params.eventId)) ctx.error('eventId must be numeric', res, []);
		if (isNaN(req.params.sinceId)) ctx.error('sinceId must be numeric', res, []);
		req.models.post.find({ 
			event_id: req.params.eventId,
			id: orm.gt(req.params.sinceId)
		}, MAX_READ, function(err, posts) {
			if (err) throw err;
			res.send(posts);
		});
	});
	
}
