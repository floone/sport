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
	//var formatPosts = doT.template(document.getElementById('posttmpl').text);
	var content = document.getElementById('content');
	//var displayAllTrigger = document.getElementById('displayAllTrigger');
	//var subtitle = document.getElementById('subtitle');
	var swatch;
	var lastPostId = 0;
	var numberOfNewTweets = 0;

	var displayAll = function() {
		var i;
		for (i = 0; i < content.children.length; i++) {
			content.children[i].style.display = '';
		}
		//displayAllTrigger.style.display = 'none';
		numberOfNewTweets = 0;
	}

	var onHashChange = function() {
		clearTimeout(swatch);
		lastPostId = 0;
		//subtitle.innerHTML = '';
		//displayAllTrigger.style.display = 'none';
		var hash = window.location.hash.replace('#', '');
		if (hash === '') {
			get('http://localhost:8080/events/1/1', 
				function(jsonStr) {
					content.innerHTML = formatEvents(JSON.parse(jsonStr));
					prettyTimes();
				}, 
				function(errStr) { console.log(errStr); }
			);
		}
	}
	//var displayAllTrigger = document.getElementById('displayAllTrigger');
	//displayAllTrigger.onclick = displayAll;
	window.onhashchange = onHashChange;
	onHashChange();
})();