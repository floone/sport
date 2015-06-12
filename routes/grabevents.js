module.exports = function(ctx) {

	ctx.app.get("/grabevents", function(req, res) {
		res.send('Grabbing events...');
	});

}