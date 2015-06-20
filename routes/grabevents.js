module.exports = function(ctx) {

	ctx.app.get("/admin/events/grab", ctx.auth, function(req, res) {
		res.send('Grabbing events...');
	});

};
