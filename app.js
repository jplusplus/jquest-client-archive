/**
 * @fileOverview Main application script that initialize and configure 
 * the Express Framework, the database ORM (sequelize), the multi-language
 * support, the configuration loader and the user authentification.
 *
 * Also, that script loads every controllers (from /core/controllers), 
 * data models (from /core/models) and custom missions (from /custom).
 *
 * @name app
 * @author  Pirhoo <pirhoo@jplusplus.org>
 */

   /**
    * Express Framework
    * @type {Object}
    */
var express = require('express')
   /**
    * Filesystem manager
    * @type {Object}
    */
  , fs = require('fs')
   /**
    * Data ORM
    * @type {Sequelize}
    */
  , Sequelize = require('sequelize')  
   /**
    * Locales manager
    * @type {Object}
    */
  , i18n = require("i18n")
   /**
    * Less middle ware
    * @type {Object}
    */
  , lessMiddleware = require("less-middleware")
   /**
    * Environement configuration from 
    * a singleton instance of Config.
    *
    * The configurationfile is now accessible 
    * from global.NODE_CONFIG.
    * 
    * @type {Object}
    */
  , config = require("config")
  /**
   * Memcached class to instanciate a memcached client
   * @type {Object}
   */
  , memjs = require('memjs')
   /**
    * Authentification module  
    * @type {Object}
    */
  , passport = require("passport")
  /**
   * Flash message manager
   * @type {Object}
   */
  , flash = require('connect-flash');


/**
 * @type {Object}
 */
var app = sequelize = null;

/**
 * Loads all requires automaticly from a directory
 * @param  {String} dirname   Directory where look for the file 
 * @param  {Boolean} instance Should we instanciate each module ? 
 */
function loadAllRequires(dirname, instance) {  
  // Change the root of the directory to analyse following the given parameter
  var dir = dirname || __dirname;
  // Var to record the require
  where = typeof(where) === "object" ? where : {};  
  
  // Grab a list of our route files/directories
  fs.readdirSync(dir).forEach(function(name){

    // Find the file path
    var path = dir + '/' + name
    // Query the entry
     , stats = fs.lstatSync(path)
    // Name simplitfy
     , slug  = name.replace(/(\.js)/, "");     

    // If it's a directory...
    if( stats.isDirectory() ) {
      // Recursive calling
      loadAllRequires(path, instance);      
    // If it's a regular file...
    } else {   
      // Require the module with app in parameter
      where[slug] = instance ? require(path)(app) : require(path);
    }
  });
}

/**
 * Loads all missions (as module) automaticly from a directory
 * @param  {String} dirname   Directory where look for the file
 * @param  {Object} where     Object where save the instances
 * @param  {Boolean} instance Should we instanciate each module ? 
 */
function loadAllMissions(dirname, where) {

  // Var to record the require
  var where = typeof(where) === "object" ? where : {},
      index = 0;
  
  // Grab a list of our route files/directories
  fs.readdirSync(dirname).forEach(function(name){
    
    // Find the file path
    var path = dirname + '/' + name
    // Query the entry
     , stats = fs.lstatSync(path)
    // Package path
    ,pkgPath = path + '/package.json';  

    // If it's a directory...
    if( stats.isDirectory() && fs.existsSync(pkgPath) ) {  

      // Load and parse the JSON package
      var pkg = JSON.parse( fs.readFileSync(pkgPath, 'utf8') );

      if( pkg.name ) {
        // Require the mission file (use the mission id as key)
        where[pkg.name] = require(path);
      }
    }

  });

}



/**
 * Loads all models automaticly from the /models directory
 * @param  {String} dirname   Directory where look for the file
 * @param  {Object} where     Object where save the instances
 */
function importAllModels(dirname, where) {  
  // Change the root of the directory to analyse following the given parameter
  var dir = dirname || __dirname + "/models";   
  // Var to record the require
  where = typeof(where) === "object" ? where : {};     
  
  // Grab a list of our route files/directories
  fs.readdirSync(dir).forEach(function(name){
    
    // Find the file path
    var path = dir + '/' + name
    // Query the entry
     , stats = fs.lstatSync(path);

    // If it's a directory...
    if( stats.isDirectory() ) {
      // Recursive calling
      loadAllRequires(path);      
    // If it's a regular file...
    }else {
      // Imports the file to an array and a simplified name            
      where[ name.replace(/(\.js)/, "") ] = sequelize.import(path);    
    }
  });
}


/**
 * Send a basic header authentication if needed
 * @param  {Object}   req  User request
 * @param  {Object}   res  User result
 * @param  {Function} next Callback function
 */
function checkBasicAuth(req, res, next) {

  var b = process.env.BASIC_AUTH;
  // Do not protect the app if not required
  if(b) {
    // Check the authentication now
    express.basicAuth(function(username, password) {        
      return username + ":" + password == b;
    }, 'Forbidden!')(req, res, next);
  } else next();
}



/**
 * Boots the app
 * @return {Object} The app instance
 */
exports.boot = function(){

  // Creates Express server
  app = module.exports = express();   

  /**
   * Stop watching for file changes (fix a bug with runtime file)
   * @tutorial https://github.com/lorenwest/node-config/issues/28#issuecomment-7633312
   * @type {Object}
   */
  config.watchForConfigFileChanges(0);

  
  // Configuration
  app.configure(function(){
    
    app.set('views', __dirname + '/core/views');
    app.set('view engine', 'jade');
    
    /************************************
     * Client requests
     ************************************/  
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(config.salts.cookies));
    app.use(express.session());   
    // Flash messages
    // see also: https://github.com/jaredhanson/connect-flash    
    app.use(flash());

    // Less middle ware to auto-compile less files
    app.use(lessMiddleware({
      src: __dirname + '/core/public',
      // Compress the files
      compress: true,
      optimization: 2
    }));

    // Public directory
    // This line must be above the passport binding
    // to avoid multiple Passport deserialization.
    app.use(express.static(__dirname + '/core/public'));


    /************************************
     * User authentification
     ************************************/ 

    // Authentification with passport
    app.use(passport.initialize());
    app.use(passport.session());  

    // Passport session setup.
    // To support persistent login sessions, Passport needs to be able to
    // serialize users into and deserialize users out of the session. Typically,
    // this will be as simple as storing the user ID when serializing, and finding
    // the user by ID when deserializing.
    passport.serializeUser(function(user, done) {      
      done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
      done(null, obj);
    });

    /************************************
     * Configure languages   
     ************************************/   

    // Temporary solution to avoid a bug on config module
    var arrLocales = [];
    // The config module convert the array to object for a curious reason
    for(var ln in config.locale.available) {
      arrLocales.push( config.locale.available[ln] );
    }

    // using 'accept-language' header to guess language settings
    app.use(i18n.init);

    i18n.configure({
      // setup some locales
      locales     : arrLocales
      // allow the use of a cookie to define the language
      , cookie    : "language"
      // locales directory
      , directory :  "core/locales/"      
      // where to register __() and __n(), here as global variable
      , register: global
    });


    /************************************
     * Views helpers
     ************************************/   
    // Register helpers for use in view's
    app.locals({    
      // Configuration variables
      config: config,
      // Available locales
      availableLocales: arrLocales,
      getLanguageName: function(lang) {
        return {
          "fr": i18n.__("French"),
          "en": i18n.__("English")
        }[lang.toLowerCase()] || lang;
      },
      // Language helpers
      _ : i18n.__,
      _n: i18n.__n      
    });

    var auth = require("./core/controllers/users/authentication");
    // Add auto-authentification
    app.use(auth.logInWithHash);
    
    app.use(function(req, res, next) {      
      // Current hostname
      res.locals.host = req.host; 
      // The current request
      res.locals.req  = req;
      // Current user
      res.locals.user = req.isAuthenticated() && req.user.is_active ? req.user : false;
      // Current language
      res.locals.lang = i18n.getLocale(req) || config.locale.default; 
      // Add url prefix
      res.locals.url = function(u, oauthCallback) { 
        var instance = res.locals.instance;
        
        if(oauthCallback && instance) {
          return "//" + config.oauth["callback-host"] + "/" + res.locals.lang + u + "/" + instance.id; 
        } else {
          return "/" + res.locals.lang + u; 
        }
      };                           

      // Checks the language at every request
      require("./core/controllers/url").checkLanguage(req, res, function() {
        // Check the current domain to dertermine the current instance
        require("./core/controllers/url").checkInstance(req, res, function(err, instance) {
          if( !err && instance.objects.length > 0) {
            // Records the instance
            res.locals.instance = instance.objects[0]
          } else {
            // Disables instance mode
            res.locals.instance = false;
          }
          // Set up basic authentication strategy
          checkBasicAuth(req, res, next);
        }); 
      })     

    });


    /************************************
     * Cache client
     ************************************/    
    // Add conditional credidentials
    var memcachedOptions = config.memcached.username && config.memcached.password ? {      
      username : config.memcached.username,
      password : config.memcached.password
    } : {};
    // Add the expiration time
    memcachedOptions.expire = config.memcached.expire || 3600;

    // Creates the memcached client
    app.memcached = new memjs.Client.create(config.memcached.servers, memcachedOptions);
    app.memcached.flush();


    /*****************************************
     * Controllers, templates and mission encapsulation
     *****************************************/  
    
    // Load all controllers from the /controllers directory    
    loadAllRequires(__dirname + "/core/controllers", true);
    // Load all mission's class
    app.missions    = {};
    loadAllMissions(__dirname + "/custom", app.missions);


    /************************************
     * Configure router      
     ************************************/   
    // @warning Needs to be after the helpers
    app.use(app.router);
  });


  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function(){
    app.use( express.errorHandler() );
  });


  return app;

};

/************************************
 * Creates the app and listen on
 * the default port.
 ************************************/  
exports.boot().listen(process.env.PORT || config.port, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
