module.exports = function(ctx) {
	
	var orm = require('orm');
	
	var MAX_READ = 50;
	
	var getChartData = function(postModel, eventData, cb) {
		postModel.aggregate(["fetched_at"], { event_id: eventData.id }).count("id").groupBy("fetched_at").get(function (err, stats) {
			var data = {
				labels: [],
			    datasets: [
					{
						fillColor: "rgba(151,151,151,0.2)",
						strokeColor: "rgba(151,151,151,1)",
						pointColor: "rgba(151,151,151,1)",
						pointStrokeColor: "rgba(151,151,151,1)",
						pointHighlightFill: "rgba(151,151,151,1)",
						pointHighlightStroke: "rgba(151,151,151,1)",
						data: []
					}
				]
			};
			var skippedFirst = false;
			stats.forEach(function(pair) {
				if (!skippedFirst) {
					skippedFirst = true;
				}
				else {
					//data.labels.push(pair.fetched_at);
					data.labels.push('');
					data.datasets[0].data.push(pair.count_id);
				}
			});
			cb(data);
		});
	};

	var queryPosts = function(res, postModel, eventModel, eventId, sinceId) {
		query = {};
		if (eventId) {
			if (isNaN(eventId)) ctx.error('eventId must be numeric', res, []);
			query.event_id = eventId;
		}
		if (sinceId) {
			if (isNaN(sinceId)) ctx.error('sinceId must be numeric', res, []);
			query.id = orm.gt(sinceId);
		}
		eventModel.get(eventId, function(err, eventData) {
			if (err) throw err;
			postModel.find(query, MAX_READ, ['created_at', 'Z'], function(err, posts) {
				if (err) throw err;
				var container = {};
				container.posts = posts;
				container.eventData = eventData;
				getChartData(postModel, eventData, function(stats) {
					container.stats = stats;
					res.send(container);
				});
			});
		});
	};

	ctx.app.get("/posts", function(req, res) {
		queryPosts(res, req.models.post, req.models.event, null, null);
	});
	
	ctx.app.get("/posts/:eventId", function(req, res) {
		queryPosts(res, req.models.post, req.models.event, req.params.eventId, null);
	});
	
	ctx.app.get("/posts/:eventId/since/:sinceId", function(req, res) {
		queryPosts(res, req.models.post, req.models.event, req.params.eventId, req.params.sinceId);
	});
	
};
