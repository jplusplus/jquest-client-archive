// Dependencies
var       util = require("util")
 , MissionQuiz = require("jquest-mission").MissionQuiz
           , _ = require("underscore")
      , config = require("config")
, tweetManager = require("../../core/twitter");

// Tweets array
var tweets = [];

// Add users
tweetManager.addUser({screen_name: "annelisebouyer", solution: undefined});
tweetManager.addUser({screen_name: "nicolaskb",      solution: undefined});
tweetManager.addUser({screen_name: "martin_u",       solution: undefined});
tweetManager.addUser({screen_name: "Pirhoo",         solution: "human"});
tweetManager.addUser({screen_name: "Clemence_Mercy", solution: "human"});
tweetManager.addUser({screen_name: "DDJelle",        solution: "human"});
tweetManager.addUser({screen_name: "Devergranne",    solution: "human"});
tweetManager.addUser({screen_name: "brianboyer",     solution: "human"});
tweetManager.addUser({screen_name: "jplusplus_",     solution: "bot"});
tweetManager.addUser({screen_name: "jplusplus_fr",   solution: "bot"});
tweetManager.addUser({screen_name: "SwiftKey",       solution: "bot"});
tweetManager.addUser({screen_name: "DeliciousHot",   solution: "bot"});

// Force collectiong tweets
tweetManager.collectUsersTweets();

module.exports = function(api, user, mission, callback) {

  var self = this;  
  // Add several questions 
  for(var i=0; i<15; i++) self.addQuestion(getTweetFromUser);

  // Call the parent constructor
  module.exports.super_.call(self, api, user, mission, callback);

};

/**
 * Get a tweet from the tweets manager stream
 * @param  {Function} callback Callback function
 */
function getTweetFromStream(callback) {
  
  // Ask for a tweet every 500 ms
  var waitForTweet = setInterval(function() {

    // Is there tweets ?
    if(tweetManager.count() > 0) clearInterval(waitForTweet);
    else return; // No tweet, continue to wait

    var tweet = tweetManager.get( _.random(0, tweetManager.count()-1) );    

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
 * Get a tweet from the tweets manager user (yet an array)
 * @param  {Function} callback Callback function
 */
function getTweetFromUser(callback) {
  
  var tweet = false;

  do {
    // Random user
    var user = tweetManager.users[ _.random(0, tweetManager.users.length - 1) ];
    // Random tweet
    if(user.tweets.length) tweet = user.tweets[ _.random(0, user.tweets.length) ];

  } while(!tweet);

  callback(null, {
    label    : "Do you think this message was published by a human or by a robot?",
    content  : tweet.oembed.html,
    duration : 15,
    solution : user.data.solution,
    answers  : ["bot", "human"]
  });

}

/**
 * Inheritance from "MissionQuizz"
 */
util.inherits(module.exports, MissionQuiz);


exports = module.exports;