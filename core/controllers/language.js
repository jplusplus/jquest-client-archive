var config = require("config"), app;

/**
 * @author Pirhoo
 * @description Language contr
 *
 */
module.exports = function(_app) {

  app = _app;

	/*
	 * GET home page.
	 */
	app.get('/lang/:ln', function(req, res) {		
		res.cookie("language", req.params.ln.toLowerCase() );		
		res.redirect("/");
	});

};
