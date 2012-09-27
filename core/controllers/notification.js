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
, utils = require('./utils');

/**
 * @author Pirhoo
 * @description Notifications helper
 *
 */
module.exports = function(_app) {

  // Global variable
  app = _app;
  
  // Creare the Premailer client
  module.exports.createPremailer();
  // Creare the SMTP client
  module.exports.createClient();


  /*
  var options = {
    to: "pierre.romera@gmail.com",
    subject: "", 
    content: ""
  };

  app.get("/email/:slug", function(req, res) { 

    // Get and update the language
    res.cookie("language", require("./users").getUserLang(req));

    require("./page").getPage(req.params.slug, req.cookies.language, function(page) {       
            
      // Parse every variable in the given string
      options.content = parsePage({
        courseName  : "La Tweet School",
        courseLink  : config.host,
        friendEmail : "hello@pirhoo.com"
      }, page.content);

      // Changes the mail subject according the page
      options.subject = page.title;    

      res.render("email", options); 

    });

  });
  */
  /*
  // Create the template
  app.render("email", options, function(err, html) {    
    options.html = html;
    module.exports.sendMail(options, console.log);
  }); */
};

/**
 * Create premailer client to convert css to inline-css 
 * from the premailer API.
 * 
 * @return {Object} Premailer client
 */
module.exports.createPremailer = function() {
  return premailerClient = require('premailer-client').createClient();
};

/**
 * Create an SMTP client to transport the email
 * @return {Object} Smtp client
 */
module.exports.createClient = function() {
  // Creates reusable transport method (opens pool of SMTP connections)
  return smtpTransport = nodemailer.createTransport("SMTP", {
    host:  config.mail.host,
    debug: true,
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

  // Add defaults value to the mailOptions 
  mailOptions = utils.merge(mailOptions || {}, config.mail.default);

  // Converts every css to inline-css with the Premailer API
  premailerClient.getAll({ html : mailOptions.html },function(err, documents) {      

    mailOptions.html = documents.html;
    if( ! mailOptions.text ) mailOptions.text = documents.text;

    // Sends mail with defined transport object
    smtpTransport.sendMail(mailOptions, callback);
  });

};

/**
 * Replace every given variables by its value in the string.
 * @param  {Object} vars Variables to look for.
 * @param  {String} str  String to parse.
 * @return {String} String parsed.
 */
function parsePage(vars, str) {

  // For each var
  for(var index in vars) {    
    // Replace its value in the string
    str = str.replace( new RegExp("{{" + index + "}}", "gi"), vars[index]);
  }

  return str;
};
