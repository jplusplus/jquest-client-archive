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
     "name"           : "facebook" 
    ,"strategyFn"     : require("passport-facebook").Strategy
    ,"strategyOptions": config.oauth.facebook
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
