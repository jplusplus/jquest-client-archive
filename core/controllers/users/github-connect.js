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
    ,"strategyOptions": config.oauth.consumers.github
  });
  
};

