// Dependencies
var Twit = require("twit")
      , _ = require("underscore")
 , config = require("config");

// Context helper
var self;

/**
 * TweetMangager class
 * *****************************************************************************
 */
function TweetManager() {   
  self = this;
  // Every tweets 
  self.tweets = [];
  // User monitored
  self.users  = [];
  // Create user montir
  self.starUserMonitor();
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
 * @param {Array} tracks Array of track to filter
 * @return {Object} Created stream
 */
TweetManager.prototype.createStream = function(tracks) {
        
    self.stream = self.twitterClient().stream('statuses/filter', { track: tracks.join(",") });

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
 * Add user monitor
 * @param {Object} user User object to monitor
 */
TweetManager.prototype.addUser = function(user) {
  var existingUser = _.findWhere(self.users, {data: user});
  return existingUser || self.users[ self.users.push( new User(user) ) ]
}

/**
 * Start an interval to extract tweets of users
 * @return {[type]} [description]
 */
TweetManager.prototype.starUserMonitor = function() {
  if(self.userMonitor) clearInterval(self.userMonitor);
  // Collect users' tweets every 2 minutes
  self.userMonitor = setInterval(self.collectUsersTweets, 60*1000);
}

/**
 * Start an interval to extract tweets of users
 * @param {Function} callback
 */
TweetManager.prototype.collectUsersTweets = function(callback) {

  callback = callback || function() {};
  // Do not make any request if there is no user
  if(!self.users.length) return;

  var options = {
    // Get all user screen_names (limited to 100)
    screen_name : _.map( self.users.slice(0,100), function(u) { return u.data.screen_name } )
  }

  // Yet we make twitter lookup to get one last tweet of each user.
  // We probably use later a more complete solution.
  self.twitterClient().get("users/lookup", options, function(err, data) {
    // Something went wrong 
    if(err) callback(err, null);
    else {
      // Record each tweet in the right user
      _.each(data, function(user) {        
        // One or more user matchings (flexible assertion)
        _.each( self.getUsersWhere({ screen_name: user.screen_name.toLowerCase() }), function(u) {   
          var tweet = user.status;
          // Update the user data
          u.data = _.extend(u.data, _.omit(user, "status") );
          // Add the tweet to each user
          u.addTweet(tweet);
        });
      });      
      // Callback function
      callback(null, data);
    }
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
TweetManager.prototype.getTweetsWhere = function(where) {
  return _.where(self.tweets, where);
}


/**
 * Get all user matching to the given Object
 * @param  {Object} where
 * @return {Array}
 */
TweetManager.prototype.getUsersWhere = function(where) {
  return _.filter(self.users, function(user) {
    return _.findWhere([user.data], where) !== undefined;
  });
}


/**
 * User class
 * @param {Object} user User to monitor
 * *****************************************************************************
 */
function User(user) {     
  this.data = user;
  // Every user have its own 
  this.tweets = [];
}

/**
 * Get all tweet matching to the given Object
 * @param  {Object} where
 * @return {Array}
 */
User.prototype.getTweetsWhere = function(where) {
  return _.where(this.tweets, where);
}

/**
 * Add a tweet to the user (once)
 * @param {Object} tweet Tweet to add
 */
User.prototype.addTweet = function(tweet) {
  var user = this;
  // If the tweet not exists yet
  if( ! this.getTweetsWhere({id: tweet.id}).length ) {    
    // Extend the tweet
    self.extendTweet(tweet, function(err, t) {
      if(err) return;
      // Add it to the array
      user.tweets.push(t);      
    });
  }
}

// Assure the manager object is a singleton.
global.JQUEST_TWEET_MANAGER = global.JQUEST_TWEET_MANAGER ? global.JQUEST_TWEET_MANAGER : new TweetManager();

// The module exports a singleton instance of the TweetManager class so the
// instance is immediately available on require(), and the prototype methods
// aren't a part of the object namespace when inspected.
module.exports = global.JQUEST_TWEET_MANAGER;