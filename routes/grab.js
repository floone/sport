module.exports = function(ctx) {

	var getQueryString = function(ev) {
		if (ev.refresh_url) {
			return ev.refresh_url + '&count=100';
		}
		var teamhash = '#' + ev.teama + ev.teamb;
		var query = teamhash; 
		// TODO exclude RTs in query
		return '?q=' + encodeURIComponent(query) + '&result_type=recent&lang=de&count=100';
	};

	ctx.app.get("/grab", function(req, res) {
		var filterTweet = function(post) { return false; }
		var log = function(s) { console.log(s); }

		// TODO consider timezone. Maybe set OPENSHIFT_MYSQL_TIMEZONE for my case.
		req.models.event.find({}).where('datetime BETWEEN NOW() - INTERVAL 1 DAY AND NOW() + INTERVAL 1 DAY').run(function(err, events) {
			if (err) throw err;
			events.forEach(function(ev) {
				var qs = getQueryString(ev);

				ctx.twitter.find(qs, log, function(data) {
					var posts = [];
					var i;
					for (i = data.statuses.length - 1; i >= 0; i--) {
						var tweet = data.statuses[i];
						if (!filterTweet(tweet)) {
							posts.push({
								username: tweet.user.screen_name,
								text:     tweet.text,
								created_at: new Date(tweet.created_at).toISOString().slice(0, 19).replace('T', ' ')
							});
						}
					}

					// save all posts at once
					var t = new Date().getTime();
					req.models.post.create(posts, function(err, items) {
						if (err) throw err;
						t = new Date().getTime() - t;
						console.log(qs + ': saved ' + posts.length + ' posts in ' + t + 'ms');
					});

					// save refresh url
					ev.refresh_url = data.search_metadata.refresh_url;
					ev.save(function(err) {
						if (err) throw err;
					});
				});
			});
			res.send('Processing ' + events.length + ' events...');
		});
	});
}
