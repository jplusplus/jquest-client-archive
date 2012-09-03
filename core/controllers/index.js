var i18n	  = require("i18n")
, usersCtrl = require("./users");

 /**
 * @author Pirhoo
 * @description Home route binder
 *
 */
module.exports = function(app) {
	
	// Remove ending slash of every URL 
	app.get(/^(\/(.+))\/$/, function(req, res){	
		res.redirect(req.params[0]);
	});

	/*
	 * GET home page.
	 */
	app.get('/', function(req, res){		
	  res.render('index.jade', { path:"/" });
	});

};