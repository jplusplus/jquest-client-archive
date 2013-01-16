var config = require("config")
, passport = require("passport")
     , api = require("../../api")
   , async = require("async");

// Globals
var app;
// Path to token authentication
var tokenAuthPath = "/noredirect/u/auth/:token/:user"

/**
 * User connect help
 * @author Pirhoo  
 */
module.exports = function(_app) {
  app = _app;

  // Add token auth path handler
  app.get(tokenAuthPath, function(req, res) {
    // Date time object, 5 minutes ago (token expiration)
    var fiveMinAgo = new Date( (new Date()).getTime() - 5*60000 );
    // Do the token exist ?
    api.user_token({
      token: req.params.token, 
      user: req.params.user, 
      created_at__gt: fiveMinAgo.toISOString()
    }).get(function(err, result) {
      
      // No error and tokens found
      if(!err && result.objects.length > 0) {
        
        // Log the user in
        req.logIn(result.objects[0].user, function(err) {
          // Redirect to home
          res.redirect("/");          
        });

        // Remove the token 
        // Its success is optional 
        // but we add an empty callback to force the request
        api.user_token(result.objects[0].id).del(function() { });

      }
    })
  })

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
  ];

  // Checks options
  for(var key in requiredOptions) {
    // Trhows an exception if it failed
    if( ! options[ requiredOptions[key] ] ) throw new Error("Adding strategy: an option '" + requiredOptions[key] + "' is missing.");
  }

  // Create the strategy paths
  var connectPath  = '/:lang/u/' + options.name + "-connect/:instance?",
      succeedPath  = '/noredirect/u/' + options.name + "-succeed",
      failedPath   = '/noredirect/u/' + options.name + "-failed";

  // Redirect the user to Strategy authentication.  When complete, the strategy
  // will redirect the user back to the application
  app.get(connectPath, function(req, res) {
    
    // Create the strategy name according the given request (and instance)
    var strategyName = req.path.match(/(\w+)-connect(\/\d)?$/)[1];        
    
    // Is there an instance ?
    if(req.params.instance) {
      // Records the instance to redirect after authentification
      res.cookie("redirect-to-instance", req.params.instance);
    }

    // Triggers the passport authentification with the given strategy  
    passport.authenticate(strategyName)(req, res);      
  
  });


  // The user authentification failed
  app.get(failedPath, options.failedFn || failedPage);
  // The user authentification succeed
  app.get(succeedPath, options.succeedFn || succeedPage);
  
  // Add the verify function without instance prefixe
  addVerify(options);

};


/**
 * Add a verify middleware binded to given language and instance
 * @param {Object}   options  Strategy options
 */
var addVerify = module.exports.addVerify = function(options) {

  // Create the strategy strategyName without optional lang/instance prefix
  var strategyIdentifier = options.name;

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

  var strategyOptions = options.strategyOptions;
  // Generic callback url for all instances
  strategyOptions.callbackURL = "http://" + config.oauth["callback-host"] + callbackPath;  
  strategyOptions.session = false;

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

  console.log(profile);
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
        username    : profile.username || "tmp",
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

/**
 * Chooses to redirect or not the user to an instance
 * @param  {Object} req Request
 * @param  {Object} res Result
 * @return {Boolean}    True if try to redirect
 */
var redirectToInstance = module.exports.redirectToInstance = function(req, res) {
  
  var instance = req.cookies["redirect-to-instance"];
  // Do we need to redirect the user ?
  if( instance && req.isAuthenticated() ) {
    // Create the token
    var token = getRandomToken(100);
    // Send parallel requests
    async.parallel({
      // Get the instance
      instance: api.instance(instance).get,
      // Create an user token
      user_token: function(done) { api.user_token.post({
        user       : req.user.resource_uri,
        created_at : new Date(),
        token      : token
      }, done) }
    // Serie done
    }, function(err, result) {      
      // First we clear the cookie
      res.clearCookie("redirect-to-instance");
      // Failed page
      if(err) failedPage(req, res);
      else {
        var url = req.protocol + "://" + result.instance.host;
        // Add the port if not 80
           url += config.port == 80 ? "" : ":" + config.port;
        // Add the token authentication path
           url += tokenAuthPath.replace(":token", token).replace(":user", req.user.id);
        // Redirect to the authentication path on another domain
        res.redirect(url);
      }
    });

    return true;
  }

  return false;
}

/**
 * Connexion failed page
 * @param  {Object} req HTTP request
 * @param  {Object} res HTTP result
 */
var failedPage = module.exports.failedPage = function(req, res) {    
  res.render('users/login-failed');
}


/**
 * Connexion Succeed page
 * @param  {Object} req HTTP request
 * @param  {Object} res HTTP result
 */
var succeedPage = module.exports.succeedPage = function(req, res) {
  // Do not redirect if we redirect to an instance
  return !redirectToInstance(req, res) && res.redirect('/');  
}


/**
 * Generate a random token
 * @param  {Number} len Length of the token (default: 100)
 * @return {String}     Generated token
 */
var getRandomToken = module.exports.getRandomToken = function(len) {
    
  var token = "";
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < (len || 100); i++ )
    token += alphabet.charAt(Math.floor(Math.random() * alphabet.length));

  return token;
}