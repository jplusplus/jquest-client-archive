   var rest = require('restler')
    , async = require('async')
    , cache = require('memory-cache')
    ,  i18n = require("i18n")
   , config = require("config")
, usersCtrl = require("../users");

/**
 * @author Pirhoo
 * @description Courses route binder
 *
 */
module.exports = function(app) {

	/*
	 * GET topics page.
	 */
	app.get(/^\/(courses|cours)$/, function(req, res){

    // Get and update the language
  res.cookie("language", usersCtrl.getUserLang(req) );

    module.exports.getCourses(req.cookies.language, function(courses) {

      res.render('courses', 
        {
          path:"/courses",
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
module.exports.getCourses = function(lang, complete) {

  async.series([
    // Get data from cache first
    function getFromCache(fallback) { 

      // Get the course from the cache
      if( !! cache.get('courses-list--'+lang) ) complete( cache.get('courses-list--'+lang) );
      // Or get the colletion from the fallback function
      else fallback();
    },
    // Get data from the API 
    function getFromAPI() {

      // get_category_index request from the external "WordPress API"
      rest.get(config.api.hostname + "/api/get_category_index/?lang="+lang).on("complete", function(data) {

        // Put the data in the cache 
        cache.put('courses-list--'+lang, data.categories || []);

        // Call the complete function
        complete( data.categories  || []);

      });
    }        
  ]);

};


/**
 * @author Pirhoo
 * @description Get a course using its slug
 */
module.exports.getCourseBySlug = function(slug, complete) {

  async.series([
    // Get data from cache first
    function getFromCache(fallback) {      
      // Get the course from the cache
      if( !! cache.get('course--'+slug) ) complete( cache.get('course--'+slug) );
      // Or get the colletion from the fallback function
      else fallback();
    },
    // Get data from the API 
    function getFromAPI() {

      // get_category_index request from the external "WordPress API"
      rest.get(config.api.hostname + "/category/"+slug+"?lang=auto&json=1&post_type=jquest_chapter&count=10000&order_by=parent&order=ASC").on("complete", function(data) {

        // Put the data in the cache 
        cache.put('course--'+slug, data.category || null);

        // Call the complete function
        complete( data.category  || null);

      });
    }        
  ]);

};