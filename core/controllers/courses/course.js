// Modules dependencies
var coursesCtrl = require('./')
 , chaptersCtrl = require('../chapters')
 				, async = require('async')
			 , config = require("config")
 				, users = require("../users");

// Global variables
var app = sequelize = null;

/**
 * @author Pirhoo
 * @description Topics route binder
 *
 */
module.exports = function(_app, _sequelize) {

	// Set the global variables with the right values
	app 			= _app;
	sequelize = _sequelize;
 
	// GET courses page
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
			},
			// Third finds the User progression
			function getUserProgression(data, callback) {

				// If the user is authentificate
				if(req.user) {

					// Find the user whith the given id and for Twitter
					app.models.UserProgression.findAll({ 
						where: { 
							userId: 1
						}
					// If success
					}).complete(function(error, UserProgression) {
						data.push(UserProgression);
						callback(null, data);
					});

				} else {					

					callback(null, data);
				}

			},
	  ], function render(error, results) {

	  		// Switchs to the 404 page if we didn't find the category
	  		if(!results || results.length < 2) return res.render('404'); 

	  		// Computes the total user points for this course
	  		var userPoints = 0;
	  		// Fetch the user's progression array
	  		if( results[2] ) results[2].forEach(function(progress) {
	  			// If the current progression is a part of the current list
	  			for(var index = 0; index < results[1].length && results[1][index].id !== progress.chapterId ; index++ );
	  			// Add the points to the total
	  			userPoints += index < results[1].length ? progress.points : 0;
	  		});

				
				// Render on the course view
				res.render('courses/course', { 
					path						:"/courses",
					title						: results[0].title,
					// Total user points
					userPoints			: userPoints,
					// Total points
					ttPoints				: results[1].length * 100,
					// Current course details
					course    			: results[0],
					// Every chapters in this course
					chapters  			: results[1],
					// Ordering chapters (Z order, ie : 1,2,3, 6,5,4, 7,8,9, 12,11,10,...)
					chaptersOrdered : chaptersCtrl.getZOrder( results[1] ),
					// User's progression array
					progress  			: results[2],
					/**
					 * Return true if the given chapter is enabled (parent chapter unlocked)
					 * @param  {Object}  chapter The chapter to analyse
					 * @return {Boolean}
					 */
					isChapterEnabled: function(chapter) {						

						// Chapters without parent are enabled
						if( ! chapter.parent ) return true;

						// No progress list means not enabled (except for the first)
						if( ! results[2] ) return false;
						
						// Looks for the parent in the progress list
						var parent = false;
						// Fetch the progress list
						results[2].forEach(function(progress) {
							parent = progress.chapterId == chapter.parent ? true : parent;
						});

						return parent;						
					},
					/**
					 * Get the point obtained by the user for the given chapter
					 * @param  {Object} chapter Chapter
					 * @return {Integer}
					 */
					getUserPoints 	: function(chapter) {

						// No progress list means not points
						if( ! results[2] ) return 0;

						var points =  0;
						// Fetch the progress list
						results[2].forEach(function(progress) {
							points = progress.chapterId == chapter.id ? progress.points : points;
						});

						return points;
					}
				});
	  });

	});

};