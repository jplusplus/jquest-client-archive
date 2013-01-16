var	      api = require("../../api.js"),
 notification = require("../notification.js"),
  		async = require("async");
/**
 * @author Pirhoo
 * @description Login route
 *
 */
module.exports = function(app, sequelize) {

	/*
	 * GET/POST user login page.
	 */
	app.all('/:lang/u/login', loginPage);

	/*
	 * GET/POST user signup page.
	 */
	app.all('/:lang/u/signup', signupPage);

	/*
	 * GET/POST user's email confirmation page.
	 */
	app.all('/:lang/u/email-confirmation/:state/:user?/:token?', confirmationEmailPage);
};


function loginPage (req, res) {

	// Defualt locals object for this page
	var locals = function(req) {		
		return {
			data    : req.body,
			message : req.flash("message")
		}
	};

	// Email given
	if( req.param('email', false) ) {
		// Loooks for the user using its email
		api.user({email: req.param('email', '') }).get(function(err, result) {

			// No result or error
			if(err || result.objects.length === 0) {
				req.flash("message", __("The email your entered is unknown.") );								
				return res.render('users/login.jade', locals(req) );
			}

			var user = result.objects[0],
				pass = { password: req.param('password', '') };

			// Account deactivate
			if(!user.is_active) {
				req.flash("message", __("This account isn't activated yet.") );								
				return res.render('users/login.jade', locals(req) );
			}

			// Check the password
			api.user(user.id).check_password(pass).get(function(err, result) {

				// No result or error
				if(err || !result || !result.password_valid) {	
					req.flash("message", __("The email or password you entered is incorrect.") );				
					res.render('users/login.jade', locals(req) );
				} else {

					// Create a cookie for auto-connect

					// log the user in
					req.login(user, function(err) {
						res.redirect("/");					
					});
				}

			});
		});
	// No data, default behavior
	} else res.render('users/login.jade', locals(req) );
}



function signupPage (req, res) {


	// Defualt locals object for this page
	var locals = function(req) {		
		return {
			data    : req.body,
			message : req.flash("message")
		}
	};


	// Email given
	if( req.param('email', false) ) {

		var email = req.param('email', '');
		// Loooks for the user using its email
		api.user({email: email}).get(function(err, result) {
		
			switch(true) {
				// Something went wrong
				case err || !result.objects:
					var message = __("Something went wrong. Please try again.");
					break;								
				// Wrong email
				case !isValidEmail(email):
					var message = __("The email you entered is not valid.");
					break;
				// Email taken
				case result.objects.length > 0:
					var message = __("The email you entered is taken.");
					break;				
				// Uncorrect password
				case req.param('password', '').length < 6:
					var message = __("The password you entered is too short  (minimum is 6 characters).");
					break;				
				// Unmatching passwords
				case req.param('password') != req.param('password_again'):
					var message = __("The two passwords you entered are different.");
					break;								
			}			

			// Something happens
			if(message) {
				req.flash("message", message);								
				return res.render('users/signup.jade', locals(req) );
			}

			// Create the user
			api.user.post({
				username: email, // For now, we use email as username
				email: email,
				password: req.param('password', ''),
				date_joined: new Date(),
				is_active: false // confirmation needed
			}, function(err, user) {

				// Something went wrong
				if(err || !user) {
					req.flash("message", __("Something went wrong. Please try again.") );								
					return res.render('users/signup.jade', locals(req) );
				}

				// Waiting for the confirmation email!
				res.redirect("/u/email-confirmation");	
				// Send this email
				sendConfirmationEmail(user, req, res);
			})
			
		});
	// No data, default behavior
	} else res.render('users/signup.jade', locals(req) );
}

/**
 * Show the page to confirm email
 * @param  {Objcet} req Requets object
 * @param  {Ibject} res Results object 
 */
function confirmationEmailPage(req, res) {

	// A token is given, start activation
	if( req.param("token") ) {
		
	    // Do the token exist ?
	    api.user_token({
	      token: req.params.token, 
	      user: req.params.user
	    }).get(function(err, result) {

	    	// Something happens
			if(err || result.objects.length === 0) {
				// Fail
				return res.redirect('u/email-confirmation/fail');			
			}

			// Takes the first object as token
			var token = result.objects[0];
			// Remove the token
			api.user_token(token.id).del(function() {});				
			// Activate the user
			api.user(token.user.id).put({is_active: true}, function(err, user) {

    			// Something happens
				if(err || !user) {
					return res.redirect('u/email-confirmation/fail');
				}

				req.login(token.user, function(err) {
					// Success !
					return res.redirect('u/email-confirmation/success');
				});
			});
			
	    });


	} else {
		// Waiting for the email
		res.render('users/email-confirmation.jade', {state: req.param("state") });
	}
}


/**
 * Send the confirmation email to an user
 * @param  {Object} user User object
 * @param  {Object} req  Request object
 * @param  {Object} res  Result object
 */
function sendConfirmationEmail(user, req, res) {

	// Create an user token to sent it by email
	api.user_token.post({
		user: user,
        token: require("./connect").getRandomToken(30),
    	created_at: new Date()
   	}, function(err, result) {

   		if(err || !result) return; // Just stop in case of error

   		var linkToConfirm  = req.protocol + "://" + req.headers.host;
   			linkToConfirm += "/noredirect/u/email-confirmation/pending/";
   			linkToConfirm += user.id + "/";
   			linkToConfirm += result.token;

		// Creates the confirmation email
		var options = { 
			to : user.email, 
			subject: "Confirm your email",
			linkToConfirm: linkToConfirm,
			instance: res.locals.instance || false
		};

		// Creates the email template with the given page content
		app.render("emails/email-confirmation", options, function(err, html) {	
			// Add the HTML generated
			options.html = html;	
			// Sends the email 
			notification.sendMail(options);
		});
   	});
				
}

/**
 * True if the given email is valid
 * @param  {String}  email Email to test
 * @return {Boolean}       True if the email is valid
 */
function isValidEmail(email) {
	// Source:
	// http://fightingforalostcause.net/misc/2006/compare-email-regex.php
	var reg = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
	return reg.test(email)
}