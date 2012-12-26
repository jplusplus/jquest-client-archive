var config = require("config"), app;

/**
 * @author Pirhoo
 * @description Language contr
 *
 */
module.exports = function(_app) {

  app = _app;

	/*
	 * GET home page.
	 */
	app.get('/lang/:ln', function(req, res) {		
		res.cookie("language", req.params.ln.toLowerCase() );		
		res.redirect("/");
	});

};

/**
 * Check the subdomain that must contain the locale 
 * @param  {Object}   req      The request
 * @param  {Object}   res      The result of the request
 * @param  {Function} callback The callback function
 */
module.exports.checkSubdomain = function(req, res, callback) {

  if( req.subdomains.length > 0 ) {
    
    // First parameter must be the Language
    var l = 0;
    do {
      // Get the parameter
      var lang = req.subdomains[l++].toLowerCase();      
    // Check that we are not using the www prefix 
    } while(lang == "www" && l < req.subdomains.length);

    // If the lang is a valid language string
    if(  app.locals.availableLocales.indexOf(lang) > -1 ) {
      // Change the user language with it
      res.cookie("language", lang);         
      res.locals.language = lang;   
      
      if(typeof callback == 'function') callback();   
      return;
    }   

  }

  // If the lang given is not an allowed parameter
  if( [].indexOf(lang) == -1 ) {       

    // Construct the new url with the right language prefix
    var defaultUrl = req.protocol + "://" + res.locals.language + "." + config.hostname;
    // Add the path
       defaultUrl += req.path;       
    // Redirect to the user language
    res.redirect(defaultUrl);
  }

  if(typeof callback == 'function') callback();

};