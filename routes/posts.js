module.exports = function(ctx) {
	ctx.app.get("/posts", function(req, res) {
		req.models.post.find({}, 20, function(err, posts) {
			if (err) throw err;
			res.send(posts);
		});
	});
	ctx.app.get("/posts/:eventId", function(req, res) {
		if (isNaN(req.params.eventId)) ctx.error('eventId must be numeric', res, []);
		req.models.post.find({ event_id: req.params.eventId }, 20, function(err, posts) {
			if (err) throw err;
			res.send(posts);
		});
	});
	
}
