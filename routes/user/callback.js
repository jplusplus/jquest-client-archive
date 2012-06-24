var user = require("./index.js")
 ,  util = require("util");

/**
 * @author Pirhoo
 * @description Callback route
 *
 */
module.exports = function(app, db) {

	app.get('/user/callback', function(req, res){
	  
	  user.twitterConsumer().getOAuthAccessToken(req.session.twitterOauthRequestToken, req.session.twitterOauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {

	    if (error) {
				// @TODO remove that ugly message
	      res.send("Error getting OAuth access token : " + util.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+util.inspect(results)+"]", 500);

	    } else {

	      // Right here is where we would write out some nice user stuff
	      user.twitterConsumer().get("http://twitter.com/account/verify_credentials.json", oauthAccessToken, oauthAccessTokenSecret, function (error, data, response) {

	        if (error) {
	          throw new Exception("Error getting twitter screen name : " + util.inspect(error) );
	        } else {

	        	if( user.addTwitterUser( JSON.parse(data) )  ) {

		        	// Records the user access tokens
				      req.session.twitterOauthAccessToken = oauthAccessToken;
				      req.session.twitterOauthAccessTokenSecret = oauthAccessTokenSecret;

		          res.send('You are signed in: ' + req.session.twitterScreenName);
	        	}	

	        }

	      });
	    }
	  });
	});

};