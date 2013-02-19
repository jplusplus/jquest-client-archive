// Dependencies
var util      = require("util")
, MissionQuiz = require("jquest-mission").MissionQuiz
      , async = require("async")
       , Twit = require("twit")
          , _ = require("underscore")
     , config = require("config");

module.exports = function(models, userId, chapterId, callback) {

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


  self.addQuestion(function(callback) {

    getTweet("242914941621915649", function(err, tweet) {

      if(err) return callback(err, null);
      callback(null, {
        content  : tweet.oembed.html,
        label   : "Ce tweet est-il un Retweet ?",
        duration: 10,
        solution: "Oui",
        answers : ["Oui", "Non"]
      });
    });
  });


  /*

  self.addQuestion(function(callback) {
    callback(null, {
      content  : tweet.oembed.html,
      label   : "Quel est le nombre d'abonnements de cet utilisateur ?",
      duration: 10,
      solution: "189",
      answers : ["189", "269", "36 190", "9 854"]
    });
  });

  self.addQuestion(function(callback) {
    callback(null, {
      content  : tweet.oembed.html,
      label   : "Quel est le nombre d'abonnés de cet utilisateur ?",
      duration: 10,
      solution: "36 190",
      answers : ["189", "269", "36 190", "9 854"]
    });
  });

  self.addQuestion(function(callback) {
    callback(null, {
      content  : tweet.oembed.html,
      label   : "Quel est lʼidentifiant de cet utilisateur?",
      duration: 10,
      solution: "morandiniblog",
      answers : ["pirhoo", "morandiniblog", "620", "Journaliste Animateur"]
    });
  });
 */


  self.addQuestion(function(callback) {    

    getTweet("241211316403044354", function(err, tweet) {

      if(err) return callback(err, null);

      var answers = [
        tweet.in_reply_to_screen_name,
        tweet.user.screen_name,        
      ];

      // add the people mentioned in the tweet
      answers = answers.concat( _.without(tweet.mentions, tweet.in_reply_to_screen_name) );

      // Should we add other possibilities ?
      if(answers.length < 4) {        
        answers.push(tweet.user.name);
        answers = answers.concat(tweet.hashtags);
      }

      // Reduces and randomizes the array
      answers = _.shuffle( answers.slice(0,4) );

      callback(null, {
        content  : tweet.oembed.html,
        label   : "A qui est destiné ce tweet ?",
        duration: 10,
        solution: tweet.in_reply_to_screen_name,
        answers : answers
      });

    });

  });
  
  self.addQuestion(function(callback) {


    getTweet("235385538641813504", function(err, tweet) {

      if(err) return callback(err, null);

      var answers = tweet.mentions;
      answers = answers.concat(tweet.hashtags);
      answers = answers.concat([tweet.user.screen_name, tweet.user.name]);

      // Reduces and randomizes the array
      answers = _.shuffle(answers.slice(0,4));

      callback(null, {
        content  : tweet.oembed.html,
        label   : "Qui est mentionné dans ce tweet ?",
        duration: 10,
        solution: tweet.mentions,
        answers : answers
      });

    });

  });



  // Call the parent constructor
  module.exports.super_.call(self, models, userId, chapterId, callback);

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