  // Express Framework
var express        = require('express')
  // Filesystem manager
  , fs             = require('fs')
  // Data ORM
  , Sequelize      = require('sequelize')  
  // Locales manager
  , i18n           = require("i18n")
  // Less middle ware
  , lessMiddleware = require("less-middleware")
  // Environement configuration
  , config         = require("config");
  // Stop watching for file changes
  config.watchForConfigFileChanges(0);

/**
 * Global objects
 */
var app = sequelize = null;


/**
* @author Pirhoo
*
* @function
* @description Loads all requires automaticly from a directory
*/
function loadAllRequires(dirname, where) {  
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
      loadAllRequires(path);      
    // If it's a regular file...
    }else {      
      // Require the route file with app and sequelize variables
      where[slug] = require(path)(app, sequelize);    
    }
  });
}



/**
* @author Pirhoo
*
* @function
* @description Loads all models automaticly from the /models directory
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


function getDbConfigFromURL(url) {
  
  var regex  =  /(\w*)\:\/\/(([a-zA-Z0-9_\-.]*)\:([a-zA-Z0-9_\-.]*))?@([a-zA-Z0-9_\-.]*)(\:(\d+))?\/([a-zA-Z0-9_\-.]*)/
  ,   fields = [undefined, "dialect", "auth", "username", "password", "host", undefined, "port", "database"]
  ,   match  = url.match(regex)
  ,   conf   = {};
  
  // Puts every match in the right field
  for(var index in fields) {
    
    var fieldName = fields[index];
    // If the current field index matches to something
    if( fieldName && match[index] ) {
      conf[fieldName] = match[index];
    }
  }
  
  // Return the configuration
  return conf;
}



/**
* @author Pirhoo
*
* @function
* @description
*/
exports.boot = function(){

  // Environement configuration
  process.env.DATABASE_URL = process.env.DATABASE_URL || config.db.uri;
  process.env.PORT = process.env.PORT || config.port;

  // Creates Express server
  app = module.exports = express.createServer();
  
  // Database configuration
  var dbConfig = getDbConfigFromURL(process.env.DATABASE_URL);  
  // Database instance 
  sequelize  = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);      

  // Configuration
  app.configure(function(){
    
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    
    // using 'accept-language' header to guess language settings
    app.use(i18n.init);

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'L7mdcS4k5JzIepqwTaVdTGp4uZi4iIYF0ht2bkET' }));
    
    app.use(app.router);

    // Less middle ware to auto-compile less files
    app.use(lessMiddleware({
      src: __dirname + '/public',
      // Compress the files
      compress: true
    }));

    // Public directory
    app.use(express.static(__dirname + '/public'));
  });

  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function(){
    app.use( express.errorHandler() );
  });

  // Temporary solution to avoid a bug on config module
  var arr = [];
  // The config module convert the array to object for a curious reason
  for(var ln in config.locale.available) {
    arr.push( config.locale.available[ln] );
  }
  // So we convert it and set the new values
  config.locale.available = arr;

  i18n.configure({
    // setup some locales
    locales: config.locale.available
  });

  // Register helpers for use in view's
  app.helpers({
    _: function(msg) {
      i18n.setLocale(this.session.language || config.locale.default);
      return i18n.__(msg);
    },
    _n: function(singular, plural, count) {
      i18n.setLocale(this.session.language || config.locale.default);
      return i18n.__n(singular, plural, count);
    },
    getLanguageName: function(lang) {
      return {
        "fr": i18n.__("French"),
        "en": i18n.__("English")
      }[lang.toLowerCase()] || lang;
    }
  });

  // Dynamic view's helpers
  app.dynamicHelpers({
    // Current user
    currentUser: function (req, res) {
      return req.session.currentUser;
    },
    // Current route
    currentRoute: function(req, res) {
      return req.route;
    },
    // Current request session
    session: function(req, res){
      return req.session;
    },
    // Configuration variables
    config:function() {
      return config;
    },
    // User language
    userLang: function(req) {
      return req.session.language || i18n.getLocale(req) || config.locale.default;
    }
  });

  // all models and controller on this scope
  app.controllers = app.models = {};
  // add the config object to the app to be accessible in the sub modules
  app.config = config;

  // Import all models from the /models directory
  importAllModels(__dirname + "/models", app.models);
  // Load all controllers from the /controllers directory
  loadAllRequires(__dirname + "/controllers", app.controllers);

  // Sync the database with the object models
  sequelize.sync({force: process.env.PORT ? true : false});

  return app;
};

exports.boot().listen(process.env.PORT, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
