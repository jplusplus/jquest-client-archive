var util = require("util")
 , oauth = require("oauth")
 ,  i18n = require("i18n")
, config = require("config");

/**
 * @author Pirhoo
 * @description Home route binder
 *
 */
module.exports = function(app, sequelize) {

	/*
	 * GET user root page.
	 */
	app.get('/users', function(req, res){

		// Redirects not logged users
		if(!req.session.currentUser) return res.redirect("/users/login");

		res.render('users', { title: i18n.__('User'), path:"/" } );
	});

};

/**
 * @author Pirhoo
 * @description Get the current user lang according to the given request
 */
module.exports.getUserLang = function(request) {	
	return request.cookies.language || i18n.getLocale(request) || config.locale.default;
};

/**
 * @author Pirhoo
 * @description Get a new Twitter consumer instance
 * @return oauth.OAuth
 */
module.exports.getTwitterConsumer = function(request) {
	
	return new oauth.OAuth(
		"https://api.twitter.com/oauth/request_token",
		"https://api.twitter.com/oauth/access_token",
	  	"mkZ4S7psHzfkDCfOzQTOg",//_twitterConsumerKey, 
	  	"ah1B8CYFt8uaIR9J1DiGV5gLwEifdEliJmNrOtOs",//_twitterConsumerSecret, 
	  	"1.0A",
	  	"http://" + request.headers.host + "/users/twitter-callback",
	  	"HMAC-SHA1"
  );
}


