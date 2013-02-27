// Dependencies
var entityManager = require("./entity.js")
         , config = require("config")
           , Twit = require("twit")
              , _ = require("underscore")

// Context helper
var self;

// Family id for 
var FAMILY_ID = 1;

/**
 * TweetMangager class
 * *****************************************************************************
 */
function TweetManager() {   
  self = this;
  // Export the family id
  self.FAMILY_ID = FAMILY_ID;
  // Every tweets 
  self.statuses = [];
  // User monitored
  self.users  = [];
  // Create user monitor
  self.starUserMonitor();
}


/**
 * Pass in the 'created_at' string returned from twitter
 * stamp arrives formatted as Tue Apr 07 22:52:51 +0000 2009 
 * @src http://www.quietless.com/kitchen/format-twitter-created_at-date-with-javascript/
 */
TweetManager.prototype.parseDate = function(stamp)
{   
  // convert to local string and remove seconds and year   
  var date = new Date(Date.parse(stamp)).toLocaleString().substr(0, 16);
  // get the two digit hour
  var hour = date.substr(-5, 2);
  // convert to AM or PM
  var ampm = hour<12 ? ' AM' : ' PM';
  if (hour>12) hour-= 12;
  if (hour==0) hour = 12;
  // return the formatted string
  return date.substr(0, 11)+' • ' + hour + date.substr(13) + ampm;
}

/**
 * Transform the given text into html (for links and hashtags)
 * @param  {String} text Text to parse
 * @return {String} Text parsed
 */
TweetManager.prototype.parseText = function(text) {

  var parseURL = function(t) {
    return t.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
      return url.link(url);
    });
  };

  var parseUsername = function(t) {
    return t.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
      var username = u.replace("@","")
      return u.link("http://twitter.com/"+username);
    });
  };

  var parseHashtag = function(t) {
    return t.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
      var tag = t.replace("#","%23")
      return t.link("http://search.twitter.com/search?q="+tag);
    });
  };

  return parseHashtag(parseUsername(parseURL(text)));
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

  // Do we need to extend the tweet ?
  if(tweet.oembed) return callback(null, tweet);

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

    tweet.oembed = oembed;
    // extend the clone    
    callback(null, tweet);
  });

}

/**
 * Event when the stream gets a tweet
 * @param {Object} tweet
 */
TweetManager.prototype.addTweetEvent = function(tweet) {
  
  self.extendTweet(tweet, function(err, tweetExtended) {
    if(! err) self.statuses.push(tweetExtended);
  });
}

/**
 * Add user monitor
 * @param {Object} user User object to monitor
 */
TweetManager.prototype.addUserMonitor = function(user) {
  var existingUser = _.findWhere(self.users, {data: user});
  return existingUser || self.users[ self.users.push( new User(user) ) ]
}

/**
 * Add user
 * @param {Object} user User object
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
    screen_name : _.map( self.users.slice(0,100), function(u) { return u.data.screen_name } ).join(',')
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
        _.each( self.getUsersWhere({ screen_name: user.screen_name }), function(u) {   
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
  return this.statuses.length;
}

/**
 * Get all tweet or the n one
 * @param  {Integer} n (optional) To select the n row
 * @return {Array|Object}   One or several tweet
 */
TweetManager.prototype.get = function(n) {
  if( isNaN(n) ) return this.statuses;
  else return n < this.count() ? this.statuses[n] : null;
}

/**
 * Get a tweet to evaluate from the db
 * @param  {Integer}  user    User id
 * @param  {Function} callback Callback function  
 */
TweetManager.prototype.tweetToEval = function(user, callback) {
  entityManager.entityToEval(self.FAMILY_ID, user, function(err, data) {
    err = err || !data.objects || data.objects.length == 0 || null;
    // Return the first entity body
    callback(err, err || data.objects[0].body);
  });
}


/**
 * Get all tweet matching to the given Object
 * @param  {Object} where
 * @return {Array}
 */
TweetManager.prototype.getTweetsWhere = function(where) {
  return _.where(self.statuses, where);
}

/**
 * Get the user profile matching to the given Object
 * @param   {Object} where
 * @param   {Function} callback
 * @return  {Array}
 */
TweetManager.prototype.getUserProfile = function(where, callback) {
  
  // ensure a callback function
  callback = callback || function() {};

  var users = self.getUsersWhere(where);

  // Is the user available in the list with enougth statuses?
  if(users.length && users[0].data && users[0].data.statuses.length >= 3) {
    // Send the data
    return callback(null, users[0].data); 
  // Is the user available but with not enougth statuses?
  } else if(users.length && users[0].data) {
    // Load the statuses before the callback
    return users[0].loadStatuses(callback);
  }

  // If not, loads it from twitter
  self.twitterClient().get("users/show", where, function(err, user) {
    // Error control
    if(err) return callback(err, null);
    // Save the user and load these statuses
    self.addUser(user).loadStatuses(callback);
  });  
};

/**
 * Get all user matching to the given Object
 * @param  {Object} where
 * @return {Array}
 */
TweetManager.prototype.getUsersWhere = function(where) {
  return _.filter(self.users, function(user) {
    return _.findWhere([user.data], where) != undefined;
  });
}


/**
 * User class
 * @param {Object} user User to monitor
 * *****************************************************************************
 */
function User(user) {   
  // Every user have its own statuses array
  user.statuses = user.statuses || [];  
  // Save the data
  this.data = user;
  return this;
}

/**
 * Get all tweet matching to the given Object
 * @param  {Object} where
 * @return {Array}
 */
User.prototype.getTweetsWhere = function(where) {
  return _.where(this.data.statuses, where);
}

/**
 * Add a tweet to the user (once)
 * @param {Object} tweet Tweet to add
 */
User.prototype.addTweet = function(tweet) {
  var user = this;

  // If the tweet not exists yet
  if( ! this.getTweetsWhere({id: 1*tweet.id}).length ) {  
    // Extend the tweet
    self.extendTweet(tweet, function(err, t) {
      
      if(err) return;
      // Add it to the array
      user.data.statuses.push(t);

      // Record the tweet      
      // var tweetToRecord = _.clone(t);
      // tweetToRecord.user = user.data;
      // entityManager.add(tweetToRecord, tweetToRecord.id, self.FAMILY_ID);
    });
  }
}
/**
 * Load tweet of the user
 * @param   {Function} callback
 */
User.prototype.loadStatuses = function(callback) {
  var user = this;
  // Load now the tweets of the client
  self.twitterClient().get("statuses/user_timeline", {id: user.data.id}, function(err, statuses) {
    // Error control
    if(err) return callback(err, null);
    // Adds statuses to the user object
    user.data.statuses = statuses;
    // Send the result to the callback function
    callback(null, user.data);
  });
}

// Assure the manager object is a singleton.
global.JQUEST_TWEET_MANAGER = global.JQUEST_TWEET_MANAGER ? global.JQUEST_TWEET_MANAGER : new TweetManager();

// The module exports a singleton instance of the TweetManager class so the
// instance is immediately available on require(), and the prototype methods
// aren't a part of the object namespace when inspected.
module.exports = global.JQUEST_TWEET_MANAGER;