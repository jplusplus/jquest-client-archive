/**
 * Module dependencies.
 */
var express = require('express')
  , fs      = require('fs')
  , pg      = require('pg');

/**
 * Global objects
 */
var app = db = null;


/**
* @author Pirhoo
*
* @function
* @description Loads routes' requires automaticly
*/
function bootRoutes(dirname) {  
  // Change the root of the directory to analyse following the given parameter
  var dir = dirname || __dirname + '/routes';    
  
  // Grab a list of our route files/directories
  fs.readdirSync(dir).forEach(function(name){
    
    // Find the file path
    var path = dir + '/' + name
    // Query the entry
     , stats = fs.lstatSync(path);

    // If it's a directory...
    if( stats.isDirectory() ) {
      // Recursive calling
      bootRoutes(path);      
    // If it's a regular file...
    }else {
      // Require the route file with app and db variables
      require(path)(app, db);    
    }
  });
}

/**
* @author Pirhoo
*
* @function
* @description
*/
exports.boot = function(){

  // Environement configuration
  process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://pirhoo:pirhoo@localhost:5432/jquest";
  process.env.PORT = process.env.PORT || 3000;

  // Creates Express server
  app = module.exports = express.createServer();
  // Database instance 
  db  = new pg.Client(process.env.DATABASE_URL);

  // Connexion to the database
  db.connect();

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

  // Load boot requires
  bootRoutes();

  return app;
};

exports.boot().listen(process.env.PORT, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
