					var util = require("util")
					, config = require("config")
				, passport = require("passport")
 , TwitterStrategy = require("passport-twitter").Strategy;



/**
 * @author Pirhoo
 * @description Connect route
 *
 */
module.exports = function(app, sequelize) {	
	
	// Redirect the user to Twitter for authentication.  When complete, Twitter
	// will redirect the user back to the application followings config.oauth.twitter.callback
	app.get('/users/twitter-connect', passport.authenticate('twitter'));

	// Twitter will redirect the user to this URL after approval.  Finish the
	// authentication process by attempting to obtain an access token.  If
	// access was granted, the user will be logged in.  Otherwise,
	// authentication has failed.
	app.get(config.oauth.twitter.callback, 
		passport.authenticate('twitter', { 
  		failureRedirect: '/',
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
	    callbackURL		 : config.host + config.oauth.twitter.callback
	  },
	  function(token, tokenSecret, profile, done) {

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

					done(null, {id: userOauth.user_id});			

				// The user do not exists yet
				} else{

					// We build the User to save
					var user = app.models.User.create({
						  username : profile.username
						, ugroup   : "player"
						, password : require("enc").sha1(tokenSecret)
					// Callback function
					}).complete(function(err, player) {

						// We create the UserOauth 
						userOauth = app.models.UserOauth.create({ 
							  consumer                : "twitter"
							, consumerUserId          : profile.id
							, userId 				          : player.id
							, oauthAccessToken        : token
							, oauthAccessToken_secret : tokenSecret																		
						});

						// Callback function
						done(err, player);

					});

				}

			});
	  } // end of TwitterStrategy callback function

	)); // end of TwitterStrategy

};