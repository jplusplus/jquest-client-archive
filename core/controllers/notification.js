/**
 * Environement configuration from 
 * a singleton instance of Config.
 * 
 * The configurationfile is now accessible 
 * from global.NODE_CONFIG.
 * 
 * @type {Object}
 */
var config = require("config")
/**
 * Mail manager, SMTP compliant.
 * 
 * @type {Object}
 */
, nodemailer = require("nodemailer")
/**
 * Utils functions
 * @type {Object}
 */
, utils = require('../utils')
/**
 * Mailifier
 * @type {Object}
 */
, emailify = require('emailify');

/**
 * @author Pirhoo
 * @description Notifications helper
 *
 */
module.exports = function(_app) {

  // Global variable
  app = _app;
  
  // Creare the SMTP client
  module.exports.createClient();
};


/**
 * Create an SMTP client to transport the email
 * @return {Object} Smtp client
 */
module.exports.createClient = function() {
  // Creates reusable transport method (opens pool of SMTP connections)
  return smtpTransport = nodemailer.createTransport("SMTP", {
    host:  config.mail.host,
    debug: config.mail.debug,    
    secureConnection: config.mail.secureConnection || true,
    port: config.mail.port || 465, // port for secure SMTP
    auth: {
      user: config.mail.auth.user,
      pass: config.mail.auth.pass
    }
  });
};

/**
 * Send an email with the existing SMTP client
 * @param  {Object}   mailOptions Mail option
 * @param  {Function} callback    Callback function
 */
module.exports.sendMail = function(mailOptions, callback) {

  // Create SMTP transport if not exists
  if(typeof smtpTransport == "undefined") module.exports.createClient();

  // Add defaults value to the mailOptions 
  mailOptions = utils.merge(mailOptions || {}, config.mail.default);  

  // Converts every css to inline-css with the Premailer API
  emailify.parse(mailOptions.html, function(err, content) {   
 
    if(err) return callback(err, content);
    mailOptions.html = content;

    // Sends mail with defined transport object
    smtpTransport.sendMail(mailOptions, callback);
  });

};

