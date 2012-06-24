var util = require("util")
,  oauth = require("oauth");

/**
 * @author Pirhoo
 * @description Home route binder
 *
 */
module.exports = function(app, db) {

	/*
	 * GET user root page.
	 */
	app.get('/user', function(req, res){

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
module.exports.twitterConsumer = function() {
	return new oauth.OAuth(
		"https://twitter.com/oauth/request_token",
		"https://twitter.com/oauth/access_token",
    	"mkZ4S7psHzfkDCfOzQTOg",//_twitterConsumerKey, 
    	"ah1B8CYFt8uaIR9J1DiGV5gLwEifdEliJmNrOtOs",//_twitterConsumerSecret, 
    	"1.0A",
    	"http://pirhoo.dev:3000/user/callback",
    	"HMAC-SHA1"
    );
}


/**
 * @author Pirhoo
 * @description Add the given data as a User to the data (update if exists)
 * @return boolean
 */
module.exports.addTwitterUser = function(data) {
	console.log(data.screen_name);
	// error handling omitted
	var query = db.query("SELECT id FROM jquest_user WHERE username=$1", [ data.screen_name ]);
	query.on("end", function(result) {
		console.log(result);	
	});
		
	return true;
}

