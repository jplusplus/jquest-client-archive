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

// To code a mission, developers can use an abstract class. 
// They will implement an open source module (via npm or github) 
// and implement methods from this class.

/**
* Implements the class that'll check on the advancement of the user
* @param  {Object}   user   The object containing the user
* @return {Boolean}         Retourns true if the mission is completed
*/
module.exports.prototype.isCompleted = function(user) {
  // Things to check upon...
  // For instance, does the user follow the aforementioned account ?
  //     we can write a function to check up on that
  //     module.exports.areFriends(user.nickname, exports.accound_to_find)

  return true; // Or false if the condition isn't satisfied
};


exports = module.exports;