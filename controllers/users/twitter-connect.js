var util = require("util");

/**
 * @author Pirhoo
 * @description Connect route
 *
 */
module.exports = function(app, sequelize) {
	
	app.get('/users/twitter-connect', function(req, res){

		require("./index.js")
		.getTwitterConsumer(req)
		.getOAuthRequestToken(
			function(
					error
				, oauthToken
				, oauthTokenSecret
				, results
			){
				
				if (error) {

					// @TODO remove that ugly message
				  res.send("Error getting OAuth request token : " + util.inspect(error), 500);

				} else {

					// Records the request token in session
				  req.session.twitterOauthRequestToken = oauthToken;
				  req.session.twitterOauthRequestTokenSecret = oauthTokenSecret;

				  // Redirect the user to the Twitter Connect Form
				  res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.twitterOauthRequestToken);
				}
			}
		);
	});

};