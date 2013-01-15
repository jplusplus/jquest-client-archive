var config = require("config"),
      i18n = require("i18n"),
       api = require("../api");

module.exports = function(a) { 
  app = a; 
  return module.exports; 
};

/**
 * Check the subdomain that must contain the locale 
 * @param  {Object}   req      The request
 * @param  {Object}   res      The result of the request
 * @param  {Function} callback The callback function
 */
module.exports.checkLanguage = function(req, res, callback) {

  if( req.params && req.params.lang ) {    
    // First parameter must be the Language
    // Get the parameter
    var lang = (req.params.lang || "").toLowerCase();    
  } else {
    // First parameter must be the Language
    // Use non-explicit matching to get the language
    var matches = req.path.match(/^(\/?(\w+)).*/i),
           lang = matches && matches.length > 2 ? matches[2] : null; 
  }

  // If the lang is a valid language string
  if(  app.locals.availableLocales.indexOf(lang) > -1 ) {

    // Change the user language with it
    i18n.setLocale(req, lang);
    res.locals.lang = lang;    
    
  // Any given lang is good (or accept redirection)
  } else if(lang != "noredirect") {

    // Determines the languages without the url
    var lang = i18n.getLocale(req) || config.locale.default;  
    // Find the current host
    var h = req.host,
    // And the current port
        port = config.port != 80 ? ":" + config.port : "",
    // Construct the new url with the right language suffix
      defaultUrl = req.protocol + "://" + h + port + "/" + lang;
    // Add the path
     defaultUrl += req.originalUrl;         
    // Redirect to the user language
    res.redirect(defaultUrl);
    return;
  }
   
  if(typeof callback == 'function') callback();

};



/**
 * Check the domain that must be an instance key 
 * @param  {Object}   req      The request
 * @param  {Object}   res      The result of the request
 * @param  {Function} callback The callback function
 */
module.exports.checkInstance = function(req, res, callback) {
  api.instance({ host : req.host }).get(callback)
};
