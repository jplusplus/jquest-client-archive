// Dependencies
var Twit = require("twit")
      , _ = require("underscore")
 , config = require("config");

// Context helper
var self;

/**
 * TweetMangager class
 */
function TweetManager() {   
  self = this; 
  self.tracks = ["syrian", "syria", "tweet"];
  self.tweets = [];
  self.createStream();
}


/**
 * Create a twitter client (instance of Twit) in this.twitterClient
 * @return {Twit} The twitterClient
 */
TweetManager.prototype.twitterClient = function() {
    /**
    * Twitter client
    * @type {Twit}
    */
    return self.tc || ( self.tc = new Twit({
          consumer_key        : config.oauth.consumers.twitter.consumerKey
        , consumer_secret     : config.oauth.consumers.twitter.consumerSecret
        , access_token        : config.oauth.consumers.twitter.accessToken
        , access_token_secret : config.oauth.consumers.twitter.accessTokenSecret
    }) );
};

/**
 * Create the Twitter stream using the Twitter Client
 * @return {Object} Created stream
 */
TweetManager.prototype.createStream = function() {
        
    self.stream = self.twitterClient().stream('statuses/filter', { track: self.tracks.join(",") });

    // Bind the "tweet" event
    self.stream.on("tweet", self.addTweetEvent);

    return self.stream;
};



/**
 * Extend a tweet object with its oembed code, hashtags array and mentions array
 * @param  {Object}   tweet    Tweet to extend
 * @param  {Function} callback Callback function (async format) 
 */
TweetManager.prototype.extendTweet = function(tweet, callback) {

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
  this.twitterClient().get("statuses/oembed", options, function(err, oembed) {    
    
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
 * Event when the stream gets a tweet
 * @param {Object} tweet
 */
TweetManager.prototype.addTweetEvent = function(tweet) {
  
  self.extendTweet(tweet, function(err, tweetExtended) {
    if(! err) self.tweets.push(tweetExtended);
  });
}

/**
 * Get tweets count
 * @return {Integer}
 */
TweetManager.prototype.count = function() {
  return this.tweets.length;
}

/**
 * Get all tweet or the n one
 * @param  {Integer} n (optional) To select the n row
 * @return {Array|Object}   One or several tweet
 */
TweetManager.prototype.get = function(n) {
  if( isNaN(n) ) return this.tweets;
  else return n < this.count() ? this.tweets[n] : null;
}

/**
 * Get all tweet matching to the given Object
 * @param  {Object} where
 * @return {Array}
 */
TweetManager.prototype.getWhere = function(where) {
  return _.where(self.tweets, where);
}


// Assure the manager object is a singleton.
global.JQUEST_TWEET_MANAGER = global.JQUEST_TWEET_MANAGER ? global.JQUEST_TWEET_MANAGER : new TweetManager();

// The module exports a singleton instance of the TweetManager class so the
// instance is immediately available on require(), and the prototype methods
// aren't a part of the object namespace when inspected.
module.exports = global.JQUEST_TWEET_MANAGER;