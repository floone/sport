module.exports = function(ctx) {

	var getQueryString = function(ev) {
		if (ev.refresh_url) {
			return ev.refresh_url + '&count=100';
		}
		var teamhash = '#' + ev.teama + ev.teamb;
		var query = teamhash; 
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
			for (i = 0; i < data.statuses.length; i++) {
				var tweet = data.statuses[i];
				if (!filterTweet(tweet)) {
					posts.push(tweet);
				}
			}
			
			if (posts.length > 0) {
				//logger.log('Store ' + posts.length + ' posts out of ' + data.statuses.length);
				posts.reverse();
				//db.insert('posts', posts, log);
				res.send(posts);
				return;
			}

			res.send("Found no posts");

			ev.refresh_url = data.search_metadata.refresh_url;

			// update the event
			//db.update('events', {_id:eventId}, ev, function(x) {
			//	logger.log('updated the event');
			//});

			cb('Ok, stored ' + posts.length + ' posts\n');
		});
	});
}
