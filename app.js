
/**
 * Module dependencies.
 */
var express = require('express')
  , pg      = require('pg');

// developement configuration
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://pirhoo:pirhoo@localhost:5432/jquest";

var app = module.exports = express.createServer()
  // Global variable to access to the database
  , db  = new pg.Client(process.env.DATABASE_URL);

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
  }
});


// Routes
require('./boot')(app, db);

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


