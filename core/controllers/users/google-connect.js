          var util = require("util")
          , config = require("config")
        , passport = require("passport");

/**
 * @author Pirhoo
 * @description Connect route
 *
 */
module.exports = function(_app, sequelize) {  

  app = _app;

  require("../users/connect")(app).addStrategy({
     "name"            : "google" 
    ,"strategyFn"      : require("passport-google-oauth").OAuth2Strategy
    ,"strategyOptions" : config.oauth.google
    ,"succeedFn"       : succeedPage
    ,"failedFn"        : failedPage
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