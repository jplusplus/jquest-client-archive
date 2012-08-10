var coursesCtrl = require('./')
 , chaptersCtrl = require('../chapters')
 				, async = require('async')
			 , config = require("config")
 				, users = require("../users");

/**
 * @author Pirhoo
 * @description Topics route binder
 *
 */
module.exports = function(app, sequelize) {

	/*
	 * GET topics page.
	 */
	app.get(/^\/(courses|cours)\/([a-zA-Z0-9_.-]+)$/, function(req, res){

		var defaultData = {
      stylesheets: [
        "/stylesheets/vendor/bootstrap-build/bootstrap.min.css",
        "/stylesheets/vendor/bootstrap-build/bootstrap-responsive.min.css",
        "http://fonts.googleapis.com/css?family=Share:400,700",
        "/stylesheets/style.css"
      ], 
      javascripts: [
        "/javascripts/vendor/bootstrap/bootstrap.min.js",
        "/javascripts/courses.js"                
      ]
    }; 

    req.session.language = users.getUserLang(req);

		async.waterfall([
			// First, finds the course
			function getCourse(callback) {
				// There is a function for that.
				coursesCtrl.getCourseBySlug(req.params[1], req.session.language, function(course) {
					// Next step...
					callback(null, course);
				});
			},
			// Second, finds the chapters of the given course
			function getChapters(course, callback) {

				// Any error ?
	    	if(course === null) return callback();

				// Get chapters ? There is also a function for that
				chaptersCtrl.getChaptersByCourse(req.params[1], req.session.language, function(chapters) {

					// This is the end (my only friend).
					callback(null, [course, chapters])

				});
			}		
	  ], function render(error, results) {

	  		// Switchs to the 404 page if we didn't find the category
	  		if(!results || results.length < 2) return res.render('404', defaultData); 

				// Add the given course to the default data
				var data = defaultData;

				data.title = results[0].title;
				data.course = results[0];				
				data.chapters = results[1];
				// Ordering chapters (Z order, ie : 1,2,3,6,5,4,7,8,9,12,11,10,...)
				data.chaptersOrdered = chaptersCtrl.getZOrder( results[1] );				 
				
				// Render on the course view
				res.render('courses/course', data);
	  });

	});

};