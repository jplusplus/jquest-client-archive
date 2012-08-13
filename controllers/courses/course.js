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

		// Get and update the language
    res.cookie("language", users.getUserLang(req) );

		async.waterfall([
			// First, finds the course
			function getCourse(callback) {
				// There is a function for that.
				coursesCtrl.getCourseBySlug(req.params[1], function(course) {
					// Next step...
					callback(null, course);
				});
			},
			// Second, finds the chapters of the given course
			function getChapters(course, callback) {

				// Any error ?
	    	if(course === null) return callback();

				// Get chapters ? There is also a function for that
				chaptersCtrl.getChaptersByCourse(req.params[1], function(chapters) {

					// This is the end (my only friend).
					callback(null, [course, chapters])

				});
			}		
	  ], function render(error, results) {

	  		// Switchs to the 404 page if we didn't find the category
	  		if(!results || results.length < 2) return res.render('404'); 

				// Add the given course to the default data
				var data = { 
					path:"/courses",
					title: results[0].title,
					course: results[0],
					chapters: results[1]
				};

				// Ordering chapters (Z order, ie : 1,2,3,6,5,4,7,8,9,12,11,10,...)
				data.chaptersOrdered = chaptersCtrl.getZOrder( results[1] );				 
				
				// Render on the course view
				res.render('courses/course', data);
	  });

	});

};