module.exports = function(db, cb) {
	db.define('post', {
		title: String
	});
	return cb();
};
