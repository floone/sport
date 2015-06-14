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
	
	var filterTweet = function(post) { return false; }
	
	var storePosts = function(postModel, posts, qs) {
		var t = new Date().getTime();
		postModel.create(posts, function(err, items) {
			if (err) throw err;
			t = new Date().getTime() - t;
			ctx.info(qs + ': stored ' + posts.length + ' posts in ' + t + 'ms');
		});
	}
	
	var readPosts = function(data, eventId) {
		var posts = [];
		var i;
		for (i = data.statuses.length - 1; i >= 0; i--) {
			var tweet = data.statuses[i];
			if (!filterTweet(tweet)) {
				posts.push({
					event_id: eventId,
					username: tweet.user.screen_name,
					text:     tweet.text,
					created_at: new Date(tweet.created_at).toMysqlDate(),
					original_id_str: tweet.id_str,
					profile_image_url: tweet.profile_image_url
				});
			}
		}
		return posts;
	}
	
	ctx.app.get("/grabposts", function(req, res) {
		var log = function(s) { ctx.info(s); }
		
		// TODO consider timezone. Maybe set OPENSHIFT_MYSQL_TIMEZONE for my case.
		req.models.event.find({}).where('datetime BETWEEN NOW() - INTERVAL 1 DAY AND NOW() + INTERVAL 1 DAY').run(function(err, events) {
			if (err) throw err;
			events.forEach(function(ev) {
				var qs = getQueryString(ev);
				
				ctx.twitter.find(qs, log, function(data) {
					var posts = readPosts(data, ev.id);
					storePosts(req.models.post, posts, qs);
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
