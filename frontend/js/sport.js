(function() {
	var get = function(url, cb, err) {
		var request = new XMLHttpRequest();
		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				cb(request.responseText);
			}
			else {
				err('got http code ' + request.status);
			}
		};
		request.onerror = function() {
			err('an error occurred when trying ' + url);
		};
		request.open('GET', url, true);
		request.send();
	}

	var prettyDate = function(date) {
		var s = Math.floor((new Date() - date) / 1000);
		var i = Math.floor(s / 31536000);
		if (i > 1) return i + 'y';
		i = Math.floor(s / 2592000);
		if (i > 1) return i + 'm';
		i = Math.floor(s / 86400);
		if (i >= 1) return i + 'd';
		i = Math.floor(s / 3600);
		if (i >= 1)  return i + 'h';
		i = Math.floor(s / 60);
		if (i >= 1) return i + 'm';
		return Math.floor(s) + 's';
	}

	var prettyTimes = function() {
		// update all <time> tags (posts view)
		var times = document.getElementsByTagName('time');
		for (var i = 0; i < times.length; i++) {
			var dtStr = times[i].getAttribute('datetime');
			if (dtStr) {
				times[i].innerHTML = prettyDate(new Date(dtStr));
			}
		}
		// update all <a> tags that have a data-time attribute (events view)
		var events = document.getElementsByTagName('a');
		for (var i = 0; i < events.length; i++) {
			var dtStr = events[i].getAttribute('data-time');
			if (dtStr) {
				var dt = new Date(dtStr);
				// TODO accessing the element by index is risky...
				events[i].children[2].innerHTML = ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
			}
		}
	}

	var INTERVAL = 20 * 1000;
	var MAX_POSTS_ON_PAGE = 250;

	var formatEvents = doT.template(document.getElementById('eventtmpl').text);
	var formatPosts = doT.template(document.getElementById('posttmpl').text);
	var content = document.getElementById('content');
	var swatch;
	var lastPostId = 0;
	var numberOfNewTweets = 0;
	
	var getEventId = function() {
		return window.location.hash.replace('#', '');
	};
	
	var updatePosts = function(showImmediately) {
		var eventId = getEventId();
		if (eventId === '' || isNaN(eventId)) return;
		console.log('Update posts of event ' + eventId);
		if (lastPostId === 0) content.innerHTML = '';
		
		get('/posts/' + eventId + '/since/' + lastPostId, function(jsonStr) {
			var parsed = JSON.parse(jsonStr);
			console.log(jsonStr);
			content.innerHTML = formatPosts(JSON.parse(jsonStr));
		});
	};
	
	var updateEvents = function() {
		console.log('Will display events');
		getEventsJson(function(err, jsonStr) {
			if (err) throw err;
			content.innerHTML = formatEvents(JSON.parse(jsonStr));
		});
	}
	
	var getEventsJson = function(cb) {
		var staticJsonString = document.getElementById('json_event_data').innerHTML;
		if (staticJsonString === '{"event_data":"[]"}') {
			console.log('Found template string, calling server...')
			get('/events',
				function(jsonStr) {
					cb(null, jsonStr);
				},
				function(errStr) { throw errStr; }
			);
		}
		else {
			cb(null, staticJsonString);
		}
	};

	var onHashChange = function() {
		clearTimeout(swatch);
		lastPostId = 0;
		if (getEventId() === '') {
			updateEvents();
		}
		else {
			updatePosts();
		}
	};
	
	window.onhashchange = onHashChange;
	onHashChange();
})();