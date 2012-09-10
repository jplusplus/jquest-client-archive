var coursesCtrl = require('../courses')
 , chaptersCtrl = require('./')
 		, usersCtrl = require("../users")
 				, async = require('async')
			 , config = require("config");

/**
 * @author Pirhoo
 * @description Chapter route binder
 *
 */
module.exports = function(app) {

	/*
	 * GET chapter page.
	 */
	app.get(/^\/(courses|cours)\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/, function(req, res){

		var course_slug  = req.params[1],
				chapter_slug = req.params[2],
        // Needs to be accessible in all functions of the serie
        chapter; 

		// Get and update the language
    res.cookie("language", usersCtrl.getUserLang(req) );

		async.series({
			// Finds the course
			course : function(callback) {
				// There is a function for that.
				coursesCtrl.getCourseBySlug(course_slug, function(course) {					
    			
					// Next step...
					callback(null, course);

				});
			},
			// Finds the chapter with the given slug
			chapter : function(callback) {

				// Get chapter ? There is also a function for that
				chaptersCtrl.getChapterBySlug(chapter_slug, function(chap) {
					
					// We have to save the chapter into another variable 
          // for the next step of that serie
          chapter = chap;

					// This is the end (my only friend).
					callback(null, chap);

				});
			},
			// Finds the user progression for this mission
			userProgression : function(callback) {

				// No user, we stop now
				if(!req.user) return callback(null, null);

				app.models.UserProgression.find({ 
			    where: { 
			      userId    : req.user.id,
			      chapterId : chapter.parent
			    }
			  // Request complete
			  }).complete(callback);
			}
	  }, function render(error, results) {

	  		// Switchs to the 404 page if an error happends
	  		if( !results
	  		|| results.length < 2 
	  		|| results.course  === undefined 
	  		|| results.chapter === undefined) return res.render('404'); 	

		    if( ! usersCtrl.isAllowed(results.chapter, req.user, results.userProgression) ) {

		    	res.render('401'); // Authentification required !

		    } else {

					// Render on the course view
					res.render('chapters/chapter', {				
						title 	 				: results.chapter.title + " ‹ " + results.course.title,
						course  				: results.course,
						chapter 				: results.chapter
					});

		    }
	  });


	});

};