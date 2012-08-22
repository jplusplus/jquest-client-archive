var util = require("util")
 ,  i18n = require("i18n")
, config = require("config");

/**
 * Home route binder
 * @author Pirhoo  
 */
module.exports = function(app, sequelize) {

	/*
	 * GET user root page.
	 */
	app.get('/users', function(req, res){

		// Redirects not logged users
		if(!req.user) return res.redirect("/users/login");
		res.redirect("/");

	});

};

/**
 * Get the current user lang according to the given request
 * @author Pirhoo 
 */
module.exports.getUserLang = function(request) {	
	return request.cookies.language || i18n.getLocale(request) || config.locale.default;
};
