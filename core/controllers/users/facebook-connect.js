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
    ,"strategyOptions": config.oauth.consumers.facebook
  });
  
};


