var i18n	  = require("i18n")
, usersCtrl = require("./users");

 /**
 * @author Pirhoo
 * @description Home route binder
 *
 */
module.exports = function(app) {

	/*
	 * GET home page.
	 */
	app.get('/:lang', function(req, res){	

		// No specified instance, default template
		if( ! res.locals.instance )	{
		  	res.render('home/default', { path:"/" });
		} else {	  	
			res.render('home/' +  res.locals.instance.slug , { path:"/" });	  	
		}
	});

};
