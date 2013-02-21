// Dependencies
var util      = require("util")
, MissionQuiz = require("jquest-mission").MissionQuiz
      , async = require("async")
       , Twit = require("twit")
          , _ = require("underscore")
     , config = require("config");

// Tweets array
var tweets = [];


module.exports = function(api, user, mission, callback) {

  var self = this;  

  // Add several questions 
  self.addQuestion(getTweet);
  self.addQuestion(getTweet);
  self.addQuestion(getTweet);

  var stream = twitterClient().stream('statuses/filter', { track: 'justin' })
  stream.on("tweet", addTweetEvent)

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
    if(tweets.length > 0) clearInterval(waitForTweet);
    else return; // No tweet, continue to wait

    var tweet = tweets[ _.random(0, tweets.length) ];    

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
 * Event when the stream gets a tweet
 * @param {Object} tweet
 */
function addTweetEvent(tweet) {
  extendTweet(tweet, function(err, tweetExtended) {
    if(! err) tweets.push(tweetExtended);
  });
}

function extendTweet(tweet, callback) {

  var tweetClone = _.clone(tweet);

  // Twitter request option
  var options = { 
    id: tweet.id_str, 
    align:"center", 
    hide_thread: true,
    omit_script: true,
    hide_media: true
  };

  // Get the embed code first
  twitterClient().get("statuses/oembed", options, function(err, oembed) {    
    
    // No embed code or error
    if(err != null || !oembed) {
      // Stop now
      return callback({error: err || "No embed code."}, null);
    }

    tweetClone.oembed = oembed;
    // Save the hashtags
    tweetClone.hashtags = tweetClone.text.match(/#(\w+)/g);
    // Removed every #
    tweetClone.hashtags = _.map(tweetClone.hashtags, function(el) { return el.replace("#", "")});
    // Save the mentions
    tweetClone.mentions = tweetClone.text.match(/@(\w+)/g);
    // Removed every @
    tweetClone.mentions = _.map(tweetClone.mentions, function(el) { return el.replace("@", "")});

    // extend the clone    
    callback(null, tweetClone);
  });

}



/**
 * Create a twitter client (instance of Twit) in this.twitterClient
 * @return {Twit} The twitterClient
 */
function twitterClient() {

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