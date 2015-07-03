module.exports = function(ctx) {

	ctx.app.post("/admin/insert/:entity", ctx.auth, function(req, res) {
		req.models[req.params.entity].create(req.body, function(err, items) {
			if (err) {
				res.status(500).send(err);
			}
			else {
				res.send(items);	
			}
		});
	});

	ctx.app.post("/admin/find/:entity", ctx.auth, function(req, res) {
		req.models[req.params.entity].find(req.body, function(err, items) {
			if (err) {
				res.status(500).send(err);
			}
			else {
				res.send(items);
			}
		});
	});

};
