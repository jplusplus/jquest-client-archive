var util = require("util");

/**
 * @author Pirhoo
 * @description Callback route
 *
 */
module.exports = function(app, sequelize) {

	// Routing on twitter callback
	app.get('/user/twitter-callback', function(req, res){
	  
	  // get the user index module
		require("./index.js")
		// get the twitter oauth consumer
		.getTwitterConsumer()
		// get the access token
		.getOAuthAccessToken(
			
			req.session.twitterOauthRequestToken
		, req.session.twitterOauthRequestTokenSecret
		, req.query.oauth_verifier

			// Access tokens callback
			, function(
				error
			, oauthAccessToken
			, oauthAccessTokenSecret
			, data) {

		    if (error) {
					
					// @TODO remove that ugly message
		      res.send("Error getting OAuth access token : " + util.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+util.inspect(data)+"]", 500);

		    } else {

					// Find the user whith the given id and for Twitter
					app.models.UserOauth.find({ where: {consumerUserId: data.user_id, consumer:"twitter"} })
						// If success
						.complete(function(userOauth) {

							// The user do not exists yet
							if(userOauth === null) {

								// We build the User to save
								var user = app.models.User.create({ 
									  username : data.screen_name
									, ugroup   : "player"
								// Callback function
								}).success(function(player) {		

									// We create the UserOauth 
									userOauth = app.models.UserOauth.create({ 
										  consumer                : "twitter"
										, consumerUserId          : data.user_id
										, userId 				          : player.id
										, oauthAccessToken        : oauthAccessToken
										, oauthAccessToken_secret : oauthAccessTokenSecret																	
									// Callback function
									}).complete(function() {
										return res.send('You are signed in: ' + oauthAccessToken);
									});

								});


							} else {								
								//console.log(user);
								res.send('You are signed in: ' + oauthAccessToken);
							}


						});
		  	}
  		}
  	);
	});

};