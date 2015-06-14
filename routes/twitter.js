module.exports = function(ctx) {
	var OAuth = require('oauth').OAuth;
	var msg = 'Required: TW_CONSUMER_KEY, TW_CONSUMER_SECRET, TW_ACCESS_TOKEN, TW_ACCESS_TOKEN_SECRET';

	var consumerKey        = process.env.TW_CONSUMER_KEY        || ctx.error('Missing TW_CONSUMER_KEY. ' + msg);
	var consumerSecret     = process.env.TW_CONSUMER_SECRET     || ctx.error('Missing TW_CONSUMER_SECRET. ' + msg);
	var accessToken        = process.env.TW_ACCESS_TOKEN        || ctx.error('Missing TW_ACCESS_TOKEN. ' + msg);
	var accessTokenSecret  = process.env.TW_ACCESS_TOKEN_SECRET || ctx.error('Missing TW_ACCESS_TOKEN_SECRET. ' + msg);
	var requestTokenUrl    = process.env.TW_REQUEST_TOKEN_URL   || 'https://api.twitter.com/oauth/request_token';
	var accessTokenUrl     = process.env.TW_ACCESS_TOKEN_URL    || 'https://api.twitter.com/oauth/access_token';
	var oauthVersion       = process.env.TW_OAUTH_VERSION       || '1.0A';
	var oauthSignatureMeth = process.env.TW_OAUTH_SIGNATURE_MET || 'HMAC-SHA1';
	var searchUrlBase      = process.env.TW_SEARCH_URL_BASE     || 'https://api.twitter.com/1.1/search/tweets.json';

	var client = function() {
		return new OAuth(
			requestTokenUrl, accessTokenUrl, consumerKey, consumerSecret, oauthVersion, null, oauthSignatureMeth
		);
	};

	var getRequest = function(url, error, success) {
		client().get(url, accessToken, accessTokenSecret, function(err, body, response) {
			// console.log('Url: %s', url);
			if (!err && response.statusCode == 200) {
				success(JSON.parse(body));
			} else {
				error(err, response, body);
			}
		});
	};

	ctx.twitter = {};
	ctx.twitter.find = function(query, error, success) {
		getRequest(searchUrlBase + query, error, success);
	}
};
