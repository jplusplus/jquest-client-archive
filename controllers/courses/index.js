var rest = require('restler')
 , async = require('async')
 , cache = require('memory-cache')
 ,  i18n = require("i18n");

/**
 * @author Pirhoo
 * @description Courses route binder
 *
 */
module.exports = function(app, sequelize) {

	/*
	 * GET topics page.
	 */
	app.get('/courses', function(req, res){

    module.exports.getCourses(function(courses) {

      res.render('courses', 
        {
          title: i18n.__('Courses'),
          stylesheets: [
            "/stylesheets/vendor/bootstrap-build/bootstrap.min.css",
            "/stylesheets/vendor/bootstrap-build/bootstrap-responsive.min.css",
            "http://fonts.googleapis.com/css?family=Share:400,700",
            "/stylesheets/style.less"
          ], 
          javascripts: [
            "/javascripts/vendor/bootstrap/bootstrap.min.js"                
          ],
          courses: courses
        }
      );

    });

	});

};


/**
 * @author Pirhoo
 * @description Get the courses from the API or from the cache
 */
module.exports.getCourses = function(complete) {

  async.series([
    // Get data from cache first
    function getFromCache(fallback) {      
      // Get the course from the cache
      if( cache.get('courses-list') ) complete( cache.get('courses-list') );
      // Or get the colletion from the fallback function
      else fallback();
    },
    // Get data from the API 
    function getFromAPI() {

      // get_category_index request from the external "WordPress API"
      rest.get("http://jquest.oeildupirate.dev/api/get_category_index/").on("complete", function(data) {

        var courses = [];
        // Filters the data (courses are categories in WordPress)
        for(var i in data.categories) {
          // Category must be a child of the "courses" category
          if( data.categories[i].parent === 3 ) {
            // So records it
            courses.push( data.categories[i] );
          }          
        }

        // Put the data in the cache 
        cache.put('courses-list', courses);

        // Call the complete function
        complete( courses );

      });
    }        
  ]);

};

/**
 * @author Pirhoo
 * @description Get a course using its slug
 */
module.exports.getCourseBySlug = function(slug, complete) {

  this.getCourses(function(courses) {

    // Index in the list    
    var i;
    // Fetchs courses list and looks for the course with the given slug
    for(i = 0; i < courses.length && courses[i].slug !== slug; ++i);

    // return null for no course found
    complete( i == courses.length ? null : courses[i] );

  });

};