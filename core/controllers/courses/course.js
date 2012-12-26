// Modules dependencies
var coursesCtrl = require('./')
 , chaptersCtrl = require('../chapters')
 				, async = require('async')
			 , config = require("config")
 				, users = require("../users")
 		 , pageCtrl = require("../page");

// Global variables
var app = null;

/**
 * @author Pirhoo
 * @description Topics route binder
 *
 */
module.exports = function(_app) {

	// Set the global variables with the right values
	app 			= _app;
 
	// GET courses page
	app.get(/^\/(courses|cours)\/([a-zA-Z0-9_.-]+)$/, function(req, res){

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
					callback(null, [course, chapters]);

				});
			},
			// Third, finds the User progressions
			function getUserProgression(data, callback) {

				// If the user is authentificate
				if(req.user) {

					// Find the user whith the given id and for Twitter
					app.models.UserProgression.findAll({ 
						where: { 
							userId: req.user.id
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
					// Ordering chapters (Z order, ie : 1,2, 4,3, 5,6, 8,7, 9,10...)
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
							parent = progress.chapterId == chapter.parent ? progress : parent;
						});

						return parent && parent.state == "succeed";						
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

  /**
   * POST an user invitation
   */
  app.post(/^\/(courses|cours)\/invite$/, function(req, res) {


  	if(! req.user) return res.json({"error" : "You must be connected to invite a friend."});

  	async.series({
  		// Get the course
  		course : function(callback) {  			
				// There is a function for that.
				coursesCtrl.getCourseBySlug(req.body.course, function(c) {					
					// Next step...
					callback(null, c);
				});
  		},
  		// Get the page's HTML
  		page : function(callback) {	  			
		    // Get and update the language
		    res.cookie("language", require("../users").getUserLang(req) );
		  	// Callback function is in the right format : function(err, page)
		  	pageCtrl.getPage("invitation-a-un-cours", req.cookies.language, callback);

  		}  		
  	}, function(err, results) {

  		if(err) return res.json({"error": err});

	  	var options = {
	  		to 		 				 : req.body.to,
	  		friendUsername : req.user.username,
	  		courseName 		 : results.course.title,  		
	  		courseLink		 : config.host + req.app.locals._("/courses/") + results.course.slug
	  	};

			// Replace the mail subject
			options.subject = results.page.subject = results.page.title;
			// Replace the page variable by
			results.page.content = pageCtrl.parsePage(options, results.page.content);
			// Add the recceiver
			results.page.to = options.to;

			// Create the email template with the given page content
			app.render("email", results.page, function(err, html) {  
				
				// Something happends during rendering
				if(err) return res.json({"error": err});
				
				// Set the mail attribut	
			  options.html = html;

			  // Sends the email
			  require("../notification").sendMail(options, function(err, result) {
			  	if(err) return res.json({"error": err});
			  	// Show the send result
			  	res.json(result);
			  });			  				  

			});

  	});	  

  });


};