module.exports = function(ctx) {
	
	var orm = require('orm');
	var fs = require('fs');
	
	var filecache = {};
	
	var cache = function(filePath, content) {
		cache[filePath] = content;
	}
	
	var getCached = function(filePath, cb) {
		if (cache[filePath]) cb(null, cache[filePath]);
		else cb();
	}
	
	ctx.app.engine('html', function (filePath, options, callback) {
		getCached(filePath, function(err, cachedContent) {
			if (err) throw err;
			var render = function(content, event_data) {
				return content.toString().replace('{"event_data":"[]"}', JSON.stringify(event_data));
			}
			if (cachedContent) {
				return callback(null, render(cachedContent, options.event_data));
			}
			else {
				fs.readFile(filePath, function (err, content) {
					if (err) return callback(new Error(err));
					ctx.info('Read file from disk: ' + filePath);
					cache(filePath, content);
					return callback(null, render(content, options.event_data));
				})
			}
		});
	});
	
	ctx.app.set('views', 'frontend');
	ctx.app.set('view engine', 'html');

	var getHomepage = function (req, res, template) {
		ctx.queryLatestEvents(req.models.event, function(err, events) {
			if (err) throw err;
			res.render(template, {event_data:events}, function(err, content) {
				res.send(content);
			});
		});
	};

	ctx.app.get('/', function (req, res) {
		getHomepage(req, res, 'index');
	});
	ctx.app.get('/dev', function (req, res) {
		getHomepage(req, res, 'index-dev');
	});
};
