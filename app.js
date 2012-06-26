/**
 * Module dependencies.
 */
var express   = require('express')
  , fs        = require('fs')
  , Sequelize = require('sequelize');

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
  ,   config = {};
  
  // Puts every match in the right field
  for(var index in fields) {
    
    var fieldName = fields[index];
    // If the current field index matches to something
    if( fieldName && match[index] ) {
      config[fieldName] = match[index];
    }
  }
  
  // Return the configuration
  return config;
}



/**
* @author Pirhoo
*
* @function
* @description
*/
exports.boot = function(){

  // Environement configuration
  process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://pirhoo:pirhoo@localhost:5432/jquest_orm";
  process.env.PORT = process.env.PORT || 3000;

  // Creates Express server
  app = module.exports = express.createServer();
  
  // Database configuration
  var config = getDbConfigFromURL(process.env.DATABASE_URL);  
  // Database instance 
  sequelize  = new Sequelize(config.database, config.username, config.password, config);      

  // Configuration
  app.configure(function(){
    
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'L7mdcS4k5JzIepqwTaVdTGp4uZi4iIYF0ht2bkET' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

  });

  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function(){
    app.use( express.errorHandler() );
  });

  // Dynamic view's helpers
  app.dynamicHelpers({
    currentUser: function (req, res) {
      return req.session.currentUser;
    },
    currentRoute: function(req, res) {
      return req.route;
    },
    session: function(req, res){
      return req.session;
    }
  });

  // all models and controller on this scope
  app.controllers = app.models = {};

  // Import all models from the /models directory
  importAllModels(__dirname + "/models", app.models);
  // Load all controllers from the /controllers directory
  loadAllRequires(__dirname + "/controllers", app.controllers);

  // Sync the database with the object models
  sequelize.sync({force:true}).complete(function(err, results) {
    console.log("Sync db:", err, results)
  });

  return app;
};

exports.boot().listen(process.env.PORT, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
