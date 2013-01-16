var i18n	= require("i18n")
, usersCtrl = require("./users")
	   , fs = require("fs");

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

		var tpl = 'home/' +  res.locals.instance.slug;
		// No specified instance, default template
		if( ! res.locals.instance || ! fs.existsSync("../"+tpl) )	{
		  	res.render('home/default', { path:"/" });
		} else {	  	
			res.render(tpl , { path:"/" });	  	
		}
	});

};
