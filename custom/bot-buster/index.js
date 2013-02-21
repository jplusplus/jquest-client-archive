// Dependencies
var       util = require("util")
 , MissionQuiz = require("jquest-mission").MissionQuiz
           , _ = require("underscore")
      , config = require("config")
, tweetManager = require("./tweetManager.js");

// Tweets array
var tweets = [];


module.exports = function(api, user, mission, callback) {

  var self = this;  

  // Add several questions 
  self.addQuestion(getTweet);
  self.addQuestion(getTweet);
  self.addQuestion(getTweet);

  // Call the parent constructor
  module.exports.super_.call(self, api, user, mission, callback);

};

/**
 * Get a tweet from the tweets manager (yet an array)
 * @param  {Function} callback Callback function
 */
function getTweet(callback) {
  
  // Ask for a tweet every 500 ms
  var waitForTweet = setInterval(function() {

    // Is there tweets ?
    if(tweetManager.count() > 0) clearInterval(waitForTweet);
    else return; // No tweet, continue to wait

    var tweet = tweetManager.get( _.random(0, tweetManager.count()) );    

    callback(null, {
      label    : "Do you think this message was published by a human or by a robot?",
      content  : tweet.oembed.html,
      duration : 15,
      solution : "Human",
      answers  : ["Bot", "Human"]
    });

  }, 500);

}

/**
 * Inheritance from "MissionQuizz"
 */
util.inherits(module.exports, MissionQuiz);


exports = module.exports;