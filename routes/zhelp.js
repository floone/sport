module.exports = function(ctx) {
	
	ctx.app.get('/', function (req, res) {
		var routes = {};
		routes.get = [];
		ctx.app.routes.get.forEach(function(route) {
			routes.get.push(route.path);
		});
		routes.get.sort();
		routes.post = [];
		ctx.app.routes.post.forEach(function(route) {
			routes.post.push(route.path);
		});
		routes.post.sort();
		res.send(routes);
	});
	
}
