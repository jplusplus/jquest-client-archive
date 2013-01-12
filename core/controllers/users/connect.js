var config = require("config")
, passport = require("passport")
     , api = require("../../api");

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
  var connectPath  = '/:lang/u/' + options.name + "-connect",
      succeedPath  = '/noredirect/u/' + options.name + "-succeed",
      failedPath   = '/noredirect/u/' + options.name + "-failed";

  // Redirect the user to Strategy authentication.  When complete, the strategy
  // will redirect the user back to the application
  app.get(connectPath, function(req, res) {
    
    // Create the strategy name according the given request (and instance)
    var   strategyName = req.path.match(/(\w+)-connect$/)[1],  
                  lang = res.locals.lang,
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
  api.instance.get(function(err, instances) {

    if(!err && instances.objects)  {

      // Get every language, one by one
      for(var l in config.locale.available) {

        // Add the verify function without instance prefixe
        addVerify(options, config.locale.available[l]);

        // Add a strategy for each existing Instance and language
        for(var i in instances.objects) {

          // Add the verify function for the given language and instance
          addVerify(options, config.locale.available[l], instances.objects[i]);          

        }
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
  var callbackPath = '/noredirect/u/' + options.name + "-callback", 
       succeedPath = '/noredirect/u/' + options.name + "-succeed",
        failedPath = '/noredirect/u/' + options.name + "-failed";

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
    strategyOptions.callbackURL = "http://" + instance.host + port + callbackPath;
  } else {
    strategyOptions.callbackURL = "http://" + config.hostname + port + callbackPath;
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
  api.user_oauth({  
    consumer_user_id : profile.id,
    consumer         : profile.provider
  }).get(function(err, res) {

    // The user already exists
    if(!err && res.objects.length > 0) {
      api.user(res.objects[0].user.id).get(done);     
    // The user do not exists yet
    } else {

      // We build the User to save
      var user = api.user.post({
        username    : profile.username,
        first_name  : "",
        last_name   : "",
        is_active   : true,
        date_joined : new Date(),
        // UserOauth object
        oauths      : {
            consumer                   : profile.provider
          , consumer_user_id           : profile.id
          , oauth_access_token         : token
          , oauth_access_token_secret  : tokenSecret                           
        }
      // Callback function
      }, done);

      // If the user is already connected with a temporary session
      // if( req.isAuthenticated() && req.user.ugroup == "tmp") { }

    }

  });

};
