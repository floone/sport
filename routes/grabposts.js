module.exports = function(ctx) {
	
	var getQueryString = function(ev) {
		if (ev.refresh_url) {
			return ev.refresh_url + '&count=100';
		}
		var query = 
			'#' + ev.teama + ev.teamb + ' OR ' + 
			'#' + ev.teama + ' OR ' + 
			'#' + ev.teamb;
		if (ev.tags) {
			query += ev.tags;
		}
		query += ' -RT';
		return '?q=' + encodeURIComponent(query) + '&result_type=recent&lang=de&count=100';
	};
	
	var filterTweet = function(post) { return false; };
	
	var storePosts = function(postModel, posts, qs) {
		var t = new Date().getTime();
		postModel.create(posts, function(err, items) {
			if (err) throw err;
			t = new Date().getTime() - t;
			ctx.info(qs + ': stored ' + posts.length + ' posts in ' + t + 'ms');
		});
	};
	
	var readPosts = function(data, eventId) {
		var posts = [];
		var i;
		var fetchedAt = new Date().toMysqlDate();
		for (i = data.statuses.length - 1; i >= 0; i--) {
			var tweet = data.statuses[i];
			if (!filterTweet(tweet)) {
				
				var media_url = null;
				if (tweet.entities.media && tweet.entities.media[0].type === 'photo') {
					media_url = tweet.entities.media[0].media_url;
				}
				
				posts.push({
					event_id: eventId,
					username: tweet.user.screen_name,
					text:     tweet.text,
					fetched_at: fetchedAt,
					created_at: new Date(tweet.created_at).toMysqlDate(),
					original_id_str: tweet.id_str,
					profile_image_url: tweet.user.profile_image_url_https,
					media_url: media_url
				});
			}
		}
		return posts;
	};
	
	ctx.app.post("/admin/grab/posts", ctx.auth, function(req, res) {
		req.models.event.find({}).where('datetime BETWEEN NOW() - INTERVAL 2 HOUR AND NOW() + INTERVAL 4 HOUR').run(function(err, events) {
			if (err) throw err;
			events.forEach(function(ev) {
				var qs = getQueryString(ev);
				
				ctx.twitter.find(qs, function(s) { ctx.debug(s); }, function(data) {
					var posts = readPosts(data, ev.id);
					storePosts(req.models.post, posts, qs);
					ev.refresh_url = data.search_metadata.refresh_url;
					ev.save(function(err) {
						if (err) throw err;
					});
				});
			});
			res.send('Processing ' + events.length + ' events.');
		});
	});
	
};
