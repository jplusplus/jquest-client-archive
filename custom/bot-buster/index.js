// Dependencies
var util      = require("util")
, MissionQuiz = require("jquest-mission").MissionQuiz
      , async = require("async")
       , Twit = require("twit")
          , _ = require("underscore")
     , config = require("config");

module.exports = function(api, user, mission, callback) {

  var self = this;  

  // Add several questions 
  self.addQuestion(function(callback) {

    getTweet("242937028055007233", function(err, tweet) {

      if(err) return callback(err, null);
      
      var solution = tweet.hashtags.slice(0,2)
         , answers = tweet.hashtags.concat([tweet.user.screen_name, tweet.user.location]);

      callback(null, {
        label    : "Quel est le hashtag utilisé ?",
        content  : tweet.oembed.html,
        duration : 10,
        solution : solution,
        answers  : _.shuffle( answers )
      });

    });

  });


  self.addQuestion(function(callback) {

    getTweet("194701750010253312", function(err, tweet) {

      if(err) return callback(err, null);

      var answers = [
        tweet.user.screen_name,  // Right one
        tweet.user.name, 
        tweet.in_reply_to_screen_name, 
        tweet.user.location
      ];

      callback(null, {
        content  : tweet.oembed.html,
        duration: 10,
        label   : "Quel est le nom d'utilisateur de l'auteur de ce Tweet ?",
        solution: tweet.user.screen_name,
        answers : _.shuffle(answers)
      });

    });
  });

  self.addQuestion(function(callback) {

    getTweet("242669557679005703", function(err, tweet) {

      if(err) return callback(err, null);

      var solution = tweet.hashtags.slice(0,2)
         , answers = tweet.hashtags.concat([tweet.user.screen_name, "Retweet"]);

      callback(null, {
        content  : tweet.oembed.html,
        label   : "À quel thème se rapporte ce Tweet ?",
        duration: 10,
        solution: solution,
        answers : _.shuffle(answers)
      });

    });

  });


  // Call the parent constructor
  module.exports.super_.call(self, api, user, mission, callback);

};

/**
 * Get a Tweet from twitter with its oembed code
 * 
 * @param  {Number}   id       ID of the tweet to look for
 * @param  {Function} callback Callback function, receiving the tweet (async style)
 */
function getTweet(id, callback) {

  var self = this;
  // Create a twitter client (if not exists)
  createTwitterClient();

  async.parallel({
    tweet: function(callback) {
      // Get the home timeline
      self.twitterClient.get("statuses/show", { id: id }, callback)
    },
    oembed: function(callback) {    
      // Twitter request option
      var options = { 
        id: id, 
        align:"center", 
        hide_thread: true,
        omit_script: true
      };
      // Get the home timeline
      self.twitterClient.get("statuses/oembed", options, callback)
    }
  }, function(err, data) {

    var tweet = null;    

    if(err) return callback(err, null);
    else if(
         !data.tweet  || data.tweet.length  === 0
      || !data.oembed || data.oembed.length === 0
    ) return callback(data, null);
    
    tweet = data.tweet[0];
    // Adds the obembed code as a Tweet attribut
    tweet.oembed = data.oembed[0];
    // Save the hashtags
    tweet.hashtags = tweet.text.match(/#(\w+)/g);
    // Removed every #
    tweet.hashtags = _.map(tweet.hashtags, function(el) { return el.replace("#", "")});
    // Save the mentions
    tweet.mentions = tweet.text.match(/@(\w+)/g);
    // Removed every @
    tweet.mentions = _.map(tweet.mentions, function(el) { return el.replace("@", "")});

    callback(err, tweet);
  });

};

/**
 * Create a twitter client (instance of Twit) in this.twitterClient
 * @return {Twit} The twitterClient
 */
function createTwitterClient() {

  /**
   * Twitter client
   * @type {Twit}
   */
  return this.twitterClient || ( this.twitterClient = new Twit({
      consumer_key        : config.oauth.consumers.twitter.consumerKey
    , consumer_secret     : config.oauth.consumers.twitter.consumerSecret
    , access_token        : config.oauth.consumers.twitter.accessToken
    , access_token_secret : config.oauth.consumers.twitter.accessTokenSecret
  }) );
  
}

/**
 * Inheritance from "MissionQuizz"
 */
util.inherits(module.exports, MissionQuiz);

exports = module.exports;