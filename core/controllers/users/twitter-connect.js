	var util = require("util")
	, config = require("config")
, passport = require("passport");

var twitterCallback = "/u/twitter-callback";

/**
 * @author Pirhoo
 * @description Connect route
 *
 */
module.exports = function(_app, sequelize) {	

	app = _app;

	require("../users/connect").addStrategy({
		 "name" 					: "twitter" 
		,"strategyFn" 		: require("passport-twitter").Strategy
		,"strategyOptions": {
	  	 "consumerKey" 			: config.oauth.twitter.consumer_key
	 	  ,"consumerSecret"		: config.oauth.twitter.consumer_secret 	  
		}
    ,"succeedFn" 			: succeedPage
    ,"failedFn"				: failedPage
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