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
         "name"            : "twitter" 
        ,"strategyFn"      : require("passport-twitter").Strategy
        ,"strategyOptions" : config.oauth.twitter
    });
    
};
