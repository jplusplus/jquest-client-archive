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
     "name"           : "github"
    ,"strategyFn"     : require("passport-github").Strategy
    ,"strategyOptions": config.oauth.github
    ,"succeedFn"      : succeedPage
    ,"failedFn"       : failedPage
  });
  
};



/**
 * github connexion failed page
 * @param  {Object} req HTTP request
 * @param  {Object} res HTTP result
 */
function failedPage(req, res) {
  res.render('users/login-failed');
}


/**
 * github connexion Succeed page
 * @param  {Object} req HTTP request
 * @param  {Object} res HTTP result
 */
function succeedPage(req, res) {
  res.redirect('/');
}