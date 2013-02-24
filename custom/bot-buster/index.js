// Dependencies
var       util = require("util")
 , MissionQuiz = require("jquest-mission").MissionQuiz
           , _ = require("underscore")
      , config = require("config")
, twitterManager = require("../../core/twitter");

// Tweets array
var tweets = [];

// Add users
twitterManager.addUser({screen_name: "annelisebouyer", solution: "human"});
twitterManager.addUser({screen_name: "nicolaskb",      solution: "human"});
twitterManager.addUser({screen_name: "martin_u",       solution: "human"});
twitterManager.addUser({screen_name: "Pirhoo",         solution: "human"});
twitterManager.addUser({screen_name: "Clemence_Mercy", solution: "human"});
twitterManager.addUser({screen_name: "DDJelle",        solution: "human"});
twitterManager.addUser({screen_name: "Devergranne",    solution: "human"});
twitterManager.addUser({screen_name: "brianboyer",     solution: "human"});
twitterManager.addUser({screen_name: "jplusplus_",     solution: "bot"});
twitterManager.addUser({screen_name: "jplusplus_fr",   solution: "bot"});
twitterManager.addUser({screen_name: "SwiftKey",       solution: "bot"});
twitterManager.addUser({screen_name: "DeliciousHot",   solution: "bot"});

// Force collectiong tweets
twitterManager.collectUsersTweets();

module.exports = function(apiManager, entityManager, user, mission, callback) {

  self = this;  
  // Add several questions from twitter user 
  for(var i=0; i<10; i++) self.addQuestion(getTweetFromUser);
  // Add several question from the database (entity to eval)
  for(var i=0; i<5;  i++) self.addQuestion(getTweetToEval);

  // Call the parent constructor
  module.exports.super_.call(self, apiManager, entityManager, user, mission, callback);

};

/**
 * Get a tweet from the tweets manager user (yet an array)
 * @param  {Function} callback Callback function
 */
function getTweetFromUser(callback) {
  
  var tweet = false;

  do {
    // Random user
    var user = twitterManager.users[ _.random(0, twitterManager.users.length - 1) ];
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
 * Get a tweet from the database to evaluate
 * @param  {Function} callback Callback function
 */
function getTweetToEval(callback) {
  
  var tweet = twitterManager.tweetToEval(self.user, function(err, tweet) {
    
    callback(err, {
      label    : "Do you think this message was published by a human or by a robot?",
      content  : err || tweet.oembed.html,
      duration : 15,
      answers  : ["bot", "human"],
      fid      : tweet.id,
      family   : twitterManager.FAMILY_ID
    });

  });

}


/**
 * Inheritance from "MissionQuizz"
 */
util.inherits(module.exports, MissionQuiz);


exports = module.exports;