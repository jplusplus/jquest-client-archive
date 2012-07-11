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
		.getTwitterConsumer(req)
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
					app.models.UserOauth.find({ 
							where: { 
								  consumerUserId: data.user_id
								, consumer:"twitter"
							}
						// If success
						}).complete(function(error, userOauth) {

							if(error) {
								console.log(error);
								return res.send("Error getting access to the database.");
							} 

							// The user do not exists yet
							if(userOauth === null) {

								// We build the User to save
								var user = app.models.User.create({ 
									  username : data.screen_name
									, ugroup   : "player"
									, password : require("enc").sha1(oauthAccessTokenSecret)
								// Callback function
								}).complete(function(err, player) {

									// We create the UserOauth 
									userOauth = app.models.UserOauth.create({ 
										  consumer                : "twitter"
										, consumerUserId          : data.user_id
										, userId 				          : player.id
										, oauthAccessToken        : oauthAccessToken
										, oauthAccessToken_secret : oauthAccessTokenSecret																	
									// Callback function
									}).complete(function(err, playerOauth) {

										// Saves the current user in a session
										req.session.currentUser = { id: player.id, password: player.password, username: player.username };										

										return res.redirect("/user/");

									});

								});


							} else {								

								// We find the User to log in
								app.models.User.find(userOauth)
									// Callback function
									.complete(function(err, player) {

											if(error) {
												console.log(error);
												return res.send("Error getting access to the database.");
											} 
											
											// Saves the current user in a session
											req.session.currentUser = { id: player.id, password: player.password, username: player.username };											

											return res.redirect("/user/");			
									});
							}


						});
		  	}
  		}
  	);
	});

};