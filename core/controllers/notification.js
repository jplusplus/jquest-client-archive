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
, utils = require('./utils')

/**
 * @author Pirhoo
 * @description Notifications helper
 *
 */
module.exports = function(app) {
  module.exports.createClient();
};

/**
 * Create an smtp client to transport the email
 * @return {Object} Smtp client
 */
module.exports.createClient = function() {
  // create reusable transport method (opens pool of SMTP connections)
  return smtpTransport = nodemailer.createTransport("SMTP", {
    host:  config.mail.host,
    auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.pass
    }
  });
};


module.exports.sendMail = function(mailOptions, callback) {  
  mailOptions = utils.merge(mailOptions || {}, config.mail.default);
  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, callback);
};

