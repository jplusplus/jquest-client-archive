var config = require("config");
/**
 * @author Pirhoo
 * @description Language contr
 *
 */
module.exports = function(app, db, controllers) {

	/*
	 * GET home page.
	 */
	app.get('/lang/:ln', function(req, res) {		
		res.cookie("language", req.params.ln.toLowerCase() );		
		res.redirect("/");
	});

};