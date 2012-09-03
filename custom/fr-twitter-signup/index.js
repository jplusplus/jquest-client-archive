// Dependencies
var util    = require("util")
  , Mission = require("jquest-mission").Mission;

module.exports = function(models, userId, chapterId, callback) {

  // Change the template directory name
  this.templateDirname = __dirname;
    
  // Call the parent constructor
  module.exports.super_.call(this, models, userId, chapterId, function() {

    // Callback function
    if(typeof callback === "function") callback.call(this);
  });

}

/**
 * Inheritance from "Mission"
 */
util.inherits(module.exports, Mission);

exports = module.exports;