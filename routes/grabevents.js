module.exports = function(ctx) {

	ctx.app.get("/admin/events/grab", function(req, res) {
		res.send('Grabbing events...');
	});

}