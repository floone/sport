module.exports = function(ctx) {
	ctx.app.get("/posts", function(req, res) {
		req.models.post.find({}, 20, function(err, posts) {
			if (err) throw err;
			res.send(posts);
		});
	});
}
