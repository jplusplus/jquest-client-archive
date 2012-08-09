var coursesCtrl = require('../courses')
 , chaptersCtrl = require('./')
 				, async = require('async');


/**
 * @author Pirhoo
 * @description Chapter route binder
 *
 */
module.exports = function(app, sequelize) {

	/*
	 * GET chapter page.
	 */
	app.get('/courses/:course_slug/:chapter_slug', function(req, res){

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

		async.parallel([
			// Finds the course
			function getCourse(callback) {
				// There is a function for that.
				coursesCtrl.getCourseBySlug(req.params.course_slug, function(course) {					
    			
					// Next step...
					callback(null, course);

				});
			},
			// Finds the chapter with the given slug
			function getChapter(callback) {

				// Get chapter ? There is also a function for that
				chaptersCtrl.getChapterBySlug(req.params.chapter_slug, function(chapter) {

					// This is the end (my only friend).
					callback(null, chapter);

				});
			}		
	  ], function render(error, results) {

	  		// Switchs to the 404 page if an error happends
	  		if(results.length < 2 
	  		|| results[0] === undefined 
	  		|| results[1] === undefined) return res.render('404', defaultData); 

				// Add the given course to the default data
				var data = defaultData;

				data.title = results[1].title + " ‹ " + results[0].title;				
				data.course = results[0];				
				data.chapter = results[1];				 
				
				// Render on the course view
				res.render('chapters/chapter', data);
	  });


	});

};