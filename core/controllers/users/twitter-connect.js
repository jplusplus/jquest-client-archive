	var util = require("util")
	, config = require("config")
, passport = require("passport");

/**
 * @author Pirhoo
 * @description Connect route
 *
 */
module.exports = function(_app, sequelize) {	

	app = _app;

	require("../users/connect")(app).addStrategy({
		 "name" 					 : "twitter" 
		,"strategyFn" 		 : require("passport-twitter").Strategy
		,"strategyOptions" : config.oauth.twitter
    ,"succeedFn" 			 : succeedPage
    ,"failedFn"				 : failedPage
	});
	
};



/**
 * Twitter connexion failed page
 * @param  {Object} req HTTP request
 * @param  {Object} res HTTP result
 */
function failedPage(req, res) {
	res.render('users/login-failed');
}


/**
 * Twitter connexion Succeed page
 * @param  {Object} req HTTP request
 * @param  {Object} res HTTP result
 */
function succeedPage(req, res) {
	res.redirect('/');
}