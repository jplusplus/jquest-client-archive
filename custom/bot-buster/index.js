// Dependencies
var       util = require("util")
 , MissionQuiz = require("jquest-mission").MissionQuiz
           , _ = require("underscore")
      , config = require("config")
, twitterManager = require("../../core/twitter");

// Tweets array
var tweets = [];

// Add bots
twitterManager.addUser({screen_name: "ChamRT", solution: "bot"});
twitterManager.addUser({screen_name: "assemroe", solution: "bot"});
twitterManager.addUser({screen_name: "Egitto3000", solution: "bot"});
twitterManager.addUser({screen_name: "Fuwaara", solution: "bot"});
twitterManager.addUser({screen_name: "leenoo1989", solution: "bot"});
// Add trusted user
twitterManager.addUser({screen_name: "acarvin", solution: "human"});
twitterManager.addUser({screen_name: "leighstream", solution: "human"});
twitterManager.addUser({screen_name: "jenanmoussa", solution: "human"});
twitterManager.addUser({screen_name: "bbclysedoucet", solution: "human"});
twitterManager.addUser({screen_name: "RawyaRageh", solution: "human"});
twitterManager.addUser({screen_name: "hany2m", solution: "human"});
twitterManager.addUser({screen_name: "zkaram", solution: "human"});
twitterManager.addUser({screen_name: "cjchivers", solution: "human"});
twitterManager.addUser({screen_name: "gebauerspon", solution: "human"});
twitterManager.addUser({screen_name: "abuaardvark", solution: "human"});
twitterManager.addUser({screen_name: "fieldproducer", solution: "human"});
twitterManager.addUser({screen_name: "Brown_Moses", solution: "human"});
twitterManager.addUser({screen_name: "NabilAbiSaab", solution: "human"});
twitterManager.addUser({screen_name: "Max_Fisher", solution: "human"});
twitterManager.addUser({screen_name: "DavidKenner", solution: "human"});
twitterManager.addUser({screen_name: "ezzsaid", solution: "human"});


// Force collectiong tweets
twitterManager.collectUsersTweets();

module.exports = function(apiManager, entityManager, user, mission, callback) {

  self = this;  
  // Add several questions from twitter user 
  for(var i=0; i<10; i++) self.addQuestion(getTweetFromUser);
  // Add several question from the database (entity to eval)
  for(var i=0; i<5;  i++) self.addQuestion(getTweetToEval);

  // Override the template's directory to use a custom template
  self.templateDirname  = __dirname,
  self.templateFilename = "index.jade",

  // Call the parent constructor
  module.exports.super_.call(self, apiManager, entityManager, user, mission, callback);

};

/**
 * Inheritance from "MissionQuizz"
 */
util.inherits(module.exports, MissionQuiz);

/**
 * Receive a data request
 * @param  {Object}   data     Data object (pass by GET query)
 * @param  {Function} callback Callback function]
 */
module.exports.prototype.get = function(data, callback) {

  switch(data.type) {

    case "user":
      var where = {};
      // User clause
      if(data.id) where.id = data.id;
      else if(data.screen_name) where.screen_name = data.screen_name;
      else return callback({error: "User identifier mission: use 'id' or 'screen_name' parameter."}, null);

      twitterManager.getUserProfile(where, callback);      
      break;

    default:
      callback({error: "Unknown request."}, null);      
  }

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


exports = module.exports;