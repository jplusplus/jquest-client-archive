          var util = require("util")
          , config = require("config")
        , passport = require("passport");

var twitterCallback = "/u/google-callback";

/**
 * @author Pirhoo
 * @description Connect route
 *
 */
module.exports = function(_app, sequelize) {  

  app = _app;

  require("../users/connect").addStrategy({
     "name"           : "google" 
    ,"strategyFn"     : require("passport-google-oauth").Strategy
    ,"strategyOptions": {
       "consumerKey"      : config.oauth.google.consumer_key
      ,"consumerSecret"   : config.oauth.google.consumer_secret    
    }
    ,"succeedFn"      : succeedPage
    ,"failedFn"       : failedPage
  });
  
};



/**
 * Google connexion failed page
 * @param  {Object} req HTTP request
 * @param  {Object} res HTTP result
 */
function failedPage(req, res) {
  res.render('users/login-failed');
}


/**
 * Google connexion Succeed page
 * @param  {Object} req HTTP request
 * @param  {Object} res HTTP result
 */
function succeedPage(req, res) {
  res.redirect('/');
}