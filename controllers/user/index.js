var util = require("util")
,  oauth = require("oauth");

/**
 * @author Pirhoo
 * @description Home route binder
 *
 */
module.exports = function(app, sequelize) {

	/*
	 * GET user root page.
	 */
	app.get('/user', function(req, res){


  console.log(  req.headers.host );

		// Redirects not logged users
		if(!req.session.currentUser) return res.redirect("/user/login");

		res.render('user/', 
			{ 
				title: 'jQuest', 
				stylesheets: [
					"/stylesheets/vendor/bootstrap-build/bootstrap.min.css",
					"/stylesheets/vendor/bootstrap-build/bootstrap-responsive.min.css",
					"http://fonts.googleapis.com/css?family=Share:400,700",
					"/stylesheets/style.less"
				], 
				javascripts: [
					"/javascripts/vendor/bootstrap/bootstrap.min.js"								
				]
			}
		);
	});

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
  	"http://" + request.headers.host + "/user/twitter-callback",
  	"HMAC-SHA1"
  );
}


