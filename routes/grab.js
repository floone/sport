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

		// hardcoded Pokalfinale test
		var qs = getQueryString({
			teama: 'BVB',
			teamb: 'WOB'
		});

		var filterTweet = function(post) { return false; }

		var log = function(s) { console.log(s); }

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

			var t = new Date().getTime();
			req.models.post.create(posts, function(err, items) {
				if (err) res.send(err);
				t = new Date().getTime() - t;
				console.log("Imported " + posts.length + "posts in " + t + "ms");
				return;
			});
			
			res.send("Maybe we did something, posts: " + posts.length);

			// TODO update the event
			//ev.refresh_url = data.search_metadata.refresh_url;
		});
	});
}
