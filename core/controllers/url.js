var config = require("config");

module.exports = function(a) { app = a; };

/**
 * Check the subdomain that must contain the locale 
 * @param  {Object}   req      The request
 * @param  {Object}   res      The result of the request
 * @param  {Function} callback The callback function
 */
module.exports.checkLanguage = function(req, res, callback) {

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
    // Find the current host
    var h = host(req),
    // And the current port
        port = config.port != 80 ? ":" + config.port : "",
    // Construct the new url with the right language prefix
      defaultUrl = req.protocol + "://" + res.locals.language + "." + h + port;
    // Add the path
     defaultUrl += req.originalUrl;         
    // Redirect to the user language
    //res.redirect(defaultUrl);
  }

  if(typeof callback == 'function') callback();

};



/**
 * Check the domain that must is the instance key 
 * @param  {Object}   req      The request
 * @param  {Object}   res      The result of the request
 * @param  {Function} callback The callback function
 */
module.exports.checkInstance = function(req, res, callback) {

  var instanceHost = host(req);
  // Create the user in the database
  app.models.Instance.find({    
    where: { host : instanceHost }
  // Complete callback
  }).complete(callback);

};

/**
 * Get the current host (sub domain excluded)
 * @param  {Object} req Request
 * @return {String}     Host
 */
function host(req) {
  return req.host.match(/(\w+\.(\w+))$/)[0];
};

module.exports.host = host;