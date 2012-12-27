          var util = require("util")
          , config = require("config")
        , passport = require("passport");

var facebookCallback = "/u/facebook-callback";

/**
 * @author Pirhoo
 * @description Connect route
 *
 */
module.exports = function(_app, sequelize) {  

  app = _app;

  require("../users/connect").addStrategy({
     "name"           : "facebook" 
    ,"strategyFn"     : require("passport-facebook").Strategy
    ,"strategyOptions": {
       "clientID"       : config.oauth.facebook.clientID
      ,"clientSecret"   : config.oauth.facebook.clientSecret      
    }
    ,"succeedFn"      : succeedPage
    ,"failedFn"       : failedPage
  });
  
};



/**
 * Facebook connexion failed page
 * @param  {Object} req HTTP request
 * @param  {Object} res HTTP result
 */
function failedPage(req, res) {
  res.render('users/login-failed');
}


/**
 * Facebook connexion Succeed page
 * @param  {Object} req HTTP request
 * @param  {Object} res HTTP result
 */
function succeedPage(req, res) {
  res.redirect('/');
}
