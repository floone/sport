module.exports = function(ctx) {
	ctx.app.get("/posts2", function(req, res) {
		req.models.post.find({}, function(err, posts) {
			if (err) throw err;
			res.send(posts);
		});
	});
}
