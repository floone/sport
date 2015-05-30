var createConnectionPool = function() {
	var mysql = require('mysql');
	return mysql.createPool({
		host     : process.env.OPENSHIFT_MYSQL_DB_HOST,
		port     : process.env.OPENSHIFT_MYSQL_DB_PORT,
		database : 'sport',
		user     : 'adminm9YzrXI',
		password : '3mfbsClKVgyw'
	});
}

module.exports = { createConnectionPool : createConnectionPool };
