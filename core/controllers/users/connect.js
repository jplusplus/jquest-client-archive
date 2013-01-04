var config = require("config")
, passport = require("passport");

// Globals
var app;

/**
 * User connect help
 * @author Pirhoo  
 */
module.exports = function(_app) {
  app = _app;

  return module.exports;
};

/**
 * Add a connect strategy
 * @param {Object} options Strategy options
 */
var addStrategy = module.exports.addStrategy = function(options) {

  // List of the required options
  var requiredOptions = [
     "name"           
    ,"strategyFn"           
    ,"strategyOptions"    
    ,"succeedFn"      
    ,"failedFn"  
  ];

  // Checks options
  for(var key in requiredOptions) {
    // Trhows an exception if it failed
    if( ! options[ requiredOptions[key] ] ) throw new Error("Adding strategy: an option '" + requiredOptions[key] + "' is missing.");
  }

  // Create the strategy paths
  var connectPath  = '/u/' + options.name + "-connect",
      callbackPath = '/u/' + options.name + "-callback",
      succeedPath  = '/u/' + options.name + "-succeed",
      failedPath   = '/u/' + options.name + "-failed";

  // Redirect the user to Strategy authentication.  When complete, the strategy
  // will redirect the user back to the application
  app.get(connectPath, function(req, res) {
    
    // Create the strategy name according the given request (and instance)
    var   strategyName = req.path.match(/(\w+)-connect$/)[1],  
                  lang = res.locals.language,
              instance = res.locals.instance,
    // Instance prefix is optional to determines the strategy identifier
    strategyIdentifier = ! instance ? strategyName : lang + "-" + instance.slug + "-" + strategyName;    

    // Triggers the passport authentification with the given strategy  
    passport.authenticate(strategyIdentifier)(req, res);
  });


  // The user authentification failed
  app.get(failedPath, options.failedFn);
  // The user authentification succeed
  app.get(succeedPath, options.succeedFn);

  // Gets all instances from the database
  app.models.Instance.all().success(function(instances) {

    // Get every language, one by one
    for(var l in config.locale.available) {

      // Add the verify function without instance prefixe
      addVerify(options, config.locale.available[l]);

      // Add a strategy for each existing Instance and language
      for(var i in instances) {

        // Add the verify function for the given language and instance
        addVerify(options, config.locale.available[l], instances[i]);

      }
    }

  });

};


/**
 * Add a verify middleware binded to given language and instance
 * @param {Object}   options  Strategy options
 * @param {String}   lang     Subdomain language
 * @param {String}   instance (optional) Domain instance
 */
var addVerify = module.exports.addVerify = function(options, lang, instance) {

  // Create the strategy strategyName without optional lang/instance prefix
  var strategyIdentifier = !instance ? options.name : lang + "-" + instance.slug + "-" + options.name;

  // Create the strategy paths
  var callbackPath = '/u/' + options.name + "-callback", 
       succeedPath = '/u/' + options.name + "-succeed",
        failedPath = '/u/' + options.name + "-failed";

  // Handles the Twitter callback
  app.get(callbackPath, 
    passport.authenticate(strategyIdentifier, {
      failureRedirect: failedPath,
      successRedirect: succeedPath,
    })
  );

  // Verify function fallback
  options.verifyFn = typeof options.verifyFn == "function" ? options.verifyFn : verify;

  var strategyOptions = options.strategyOptions
               , port = config.port == 80 ? "" : ":" + config.port;

  // The callback URL is different for the instance and the nude domain
  if( instance ) {
    strategyOptions.callbackURL = "http://" + lang + "." + instance.host + port + callbackPath;
  } else {
    strategyOptions.callbackURL = "http://" + lang + "." + config.hostname + port + callbackPath;
  }

  // Force passing the request to the strategy's callback
  strategyOptions.passReqToCallback = true;

  // Add the strategy
  passport.use(strategyIdentifier, new options.strategyFn(strategyOptions, options.verifyFn) );

};


/**
 * Generic strategy verification to convert a profile to an user account
 * @param  {Object}   req         Request
 * @param  {String}   token       Oauth token
 * @param  {Qtring}   tokenSecret Oauth token secret
 * @param  {Object}   profile     Profile given by the provider
 * @param  {Function} done        Callback function
 */
var verify = module.exports.verify = function(req, token, tokenSecret, profile, done) {

  // Find the user whith the given id and for Twitter
  app.models.UserOauth.find({ 
    where: { 
        consumerUserId: profile.id
      , consumer:"twitter"
    }
  // If success
  }).complete(function(error, userOauth) {

    // The user already exists
    if(userOauth !== null) {

      done(null, {id: userOauth.userId});     

    // The user do not exists yet
    } else {

      // If the user is already connected with a temporary session
      if( req.isAuthenticated() && req.user.ugroup == "tmp") {

        // Transforms the current temporary user
        // to a complete player user
        req.user.ugroup   = "player";
        // Completes the user information previously completed 
        // with unefficient data
        req.user.username = profile.username;
        req.user.password = require("enc").sha1( Math.random() );

        // Saves the data
        req.user.save().complete(function() { 
          // And when the user is saved, create its oauth credidentials
          createUserOauth(req.user, profile, token, tokenSecret, done);
        });

      // The user isn't connected yet with temporary session
      } else {

        // We build the User to save
        var user = app.models.User.create({
            username : profile.username
          , ugroup   : "player"
          , password : require("enc").sha1( Math.random() )

        // Callback function
        }).complete(function(err, player) {
          // Create the oauth credidentials
          // in the database
          createUserOauth(player, profile, token, tokenSecret, done);
        });

      }

    }

  });

};


/**
 * Create a new UserOauth entry in the database
 * @param  {Object}   user        Passport user object (wich is a sequelize model)
 * @param  {Object}   profile     Twitter profile object
 * @param  {String}   token       Twitter user token
 * @param  {String}   tokenSecret Twutter user token secret
 * @param  {Function} done        Callback function
 */
function createUserOauth(user, profile, token, tokenSecret, done) {

  // We create the UserOauth 
  userOauth = app.models.UserOauth.create({ 
      consumer                : profile.provider
    , consumerUserId          : profile.id
    , userId                  : user.id
    , oauthAccessToken        : token
    , oauthAccessToken_secret : tokenSecret                           
  }).complete(function(err) {               
    // Callback function
    done(err, user);
  });

};
