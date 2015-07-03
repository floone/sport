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

	ctx.app.post("/admin/update/:entity/:id", ctx.auth, function(req, res) {
		req.models[req.params.entity].get(req.params.id, function(err, item) {
			if (err) {
				res.status(500).send(err);
			}
			else {
				item.save(req.body, function(err, updatedItem) {
					if (err) {
						res.status(500).send(err);
					}
					else {
						res.send(updatedItem);
					}
				});
			}
		});
	});

	ctx.app.post("/admin/findid/:entity", ctx.auth, function(req, res) {
		req.models[req.params.entity].find(req.body, function(err, items) {
			if (err) {
				res.status(500).send(err);
			}
			else if (items.length == 0) {
				res.status(404).send("NOT_FOUND");
			}
			else {
				res.send("" + items[0].id);
			}
		});
	});

};
