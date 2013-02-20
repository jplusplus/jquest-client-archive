var i18n	= require("i18n")
, usersCtrl = require("./users")
	   , fs = require("fs")
	 , path = require("path");

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

		var tpl = 'home/' + res.locals.instance.slug + ".jade";	
		// No specified instance, default template
		if( ! res.locals.instance || ! fs.existsSync( path.join(app.get("views"), tpl) ) ) {
		  	res.render('home/default', { path:"/" });
		} else {	  	
			res.render(tpl , { path:"/" });	  	
		}
	});

};
