module.exports = function(ctx) {
		ctx.app.get("/about", function(req, res) {
				ctx.pool.getConnection(function(err, conn) {
						if (err) {
								res.send(err);
								return;
						}
						conn.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
								var result = rows[0];
								conn.release();
								res.send('Result: ' + result);
						});
				});
		});
}
