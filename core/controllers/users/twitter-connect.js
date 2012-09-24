					var util = require("util")
					, config = require("config")
				, passport = require("passport")
 , TwitterStrategy = require("passport-twitter").Strategy;


/**
 * @author Pirhoo
 * @description Connect route
 *
 */
module.exports = function(_app, sequelize) {	

	app = _app;
	
	// Redirect the user to Twitter for authentication.  When complete, Twitter
	// will redirect the user back to the application followings config.oauth.twitter.callback
	app.get('/users/twitter-connect', passport.authenticate('twitter'));

	// The user authentification failed
	app.get('/users/twitter-failed', failedPage);

	// Twitter will redirect the user to this URL after approval.  Finish the
	// authentication process by attempting to obtain an access token.  If
	// access was granted, the user will be logged in.  Otherwise,
	// authentication has failed.
	app.get(config.oauth.twitter.callback, 
		passport.authenticate('twitter', { 
  		failureRedirect: '/users/twitter-failed',
  		successRedirect: '/users/'
		})
	);


	/**
	 * @author Pirhoo
	 * @description Twitter strategy
	 *
	 */
	passport.use(new TwitterStrategy({
	    consumerKey    : config.oauth.twitter.consumer_key,
	    consumerSecret : config.oauth.twitter.consumer_secret,
	    callbackURL		 : config.host + config.oauth.twitter.callback,
	    passReqToCallback: true
	  },
	  function(req, token, tokenSecret, profile, done) {

			// Find the user whith the given id and for Twitter
			app.models.UserOauth.find({ 
				where: { 
					  consumerUserId: profile.id
					, consumer:"twitter"
				}
			// If success
			}).complete(function(error, userOauth) {

				// The user already exists
				if(userOauth !== null) {

					done(null, {id: userOauth.userId});			

				// The user do not exists yet
				} else {

			  	// If the user is already connected with a temporary session
			  	if( req.isAuthenticated() && req.user.ugroup == "tmp") {

			  		// Transforms the current temporary user
			  		// to a complete player user
			  		req.user.ugroup 	= "player";
			  		// Completes the user information previously completed 
			  		// with unefficient data
						req.user.username = profile.username;
						req.user.password = require("enc").sha1(tokenSecret);

						// Saves the data
						req.user.save().complete(function() { 
							// And when the user is saved, create its oauth credidentials
							createUserOauth(req.user, profile, token, tokenSecret, done);
						});

					// The user isn't connected yet with temporary session
			  	} else {

						// We build the User to save
						var user = app.models.User.create({
							  username : profile.username
							, ugroup   : "player"
							, password : require("enc").sha1(tokenSecret)

						// Callback function
						}).complete(function(err, player) {
							// Create the oauth credidentials
							// in the database
							createUserOauth(user, profile, token, tokenSecret, done);
						});

					}

				}

			});


	  } // end of TwitterStrategy callback function

	)); // end of TwitterStrategy

};

/**
 * Create a new UserOauth entry in the database
 * @param  {Object}   user        Passport user object (wich is a sequelize model)
 * @param  {Object}   profile     Twitter profile object
 * @param  {String}   token       Twitter user token
 * @param  {String}   tokenSecret Twutter user token secret
 * @param  {Function} done        Callback function
 */
function createUserOauth(user, profile, token, tokenSecret, done) {

	// We create the UserOauth 
	userOauth = app.models.UserOauth.create({ 
		  consumer                : "twitter"
		, consumerUserId          : profile.id
		, userId 				          : user.id
		, oauthAccessToken        : token
		, oauthAccessToken_secret : tokenSecret														
	}).complete(function(err) {								
		// Callback function
		done(err, user);
	});

}


/**
 * Twitter connexion failed page
 * @param  {Object} req HTTP request
 * @param  {Object} res HTTP result
 */
function failedPage(req, res) {
	res.render('users/login-failed');
}i