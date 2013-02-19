var util = require("util")
 ,  i18n = require("i18n")
, config = require("config");

// Globals
var app;

/**
 * Home route binder
 * @author Pirhoo  
 */
module.exports = function(_app) {

  app = _app;

	/*
	 * GET user root page.
	 */
	app.get('/:lang/u/', function(req, res){
		res.redirect("/");
	});

};

/**
 * Get the current user lang according to the given request
 * @author Pirhoo 
 */
module.exports.getUserLang = function(request) {	
	return request.cookies.language || i18n.getLocale(request) || config.locale.default;
};

/**
 * Determines if a user is allowed or not 
 * to access to a chapter
 * @param {Object} chapter Chapter within make the control
 * @param {Object} user (optional) User to control
 * @param {Object} userProgression (optional) UserProgession instance (or a Mission)
 * @return {Boolean} True if the user is allowed
 */
module.exports.isAllowed = function(chapter, user, userProgression) {

  // Every chapter without parent
  // are free to access
  // even if the user is not connected
  if(typeof chapter.parent == "undefined" || !chapter.parent) return true;
  
  // Is the user connected ? Is the user not temporary one ? 
  // Its required now.
  if(typeof user == "undefined" || user.ugroup == "tmp") return false; 

  // If the user exists
  // and the chapter has a parent,
  // the user must have completed the previous chapter
  return userProgression && userProgression.state == "succeed";

};


/**
 * Creates a tempory user attached to the given request
 * @param  {Object}   req  HTTP request
 * @param  {Function} callback Callback function
 */
module.exports.createTemporaryUser = function(req, callback) {
  // User already exists
  if(req.user) return callback(null, req.user);
  
  // Create the user in the database
  app.models.User.create({
    // Use the sessionID as username
    username  : req.sessionID,
    // Random token
    password  : require("enc").sha1( Math.random() ),
    // Special type for temporary user
    ugroup    : "tmp",    

  // Complete callback
  }).complete(function(err, user) {
    // No error
    if(!err) {
      // We can login the user
      req.logIn(user, function(err) {
        if(typeof callback == "function") callback(err, user);
      });
    } else {
      if(typeof callback == "function") callback(err, user);
    }
  });
};