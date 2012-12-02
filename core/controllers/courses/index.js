   var rest = require('restler')
    , async = require('async')
    ,  i18n = require("i18n")
   , config = require("config")
, usersCtrl = require("../users");

// Global app
var app = null;

/**
 * @author Pirhoo
 * @description Courses route binder
 *
 */
module.exports = function(_app) {

  // Save app
  app = _app;

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

      // Get the courses from the cache
      app.memcached.get('courses-list--'+lang, function(err, value) {            

        // Gets the colletion from the fallback function
        if(err != null ||  value == null || !value.length ) fallback();
        // Parse the received string
        else complete( JSON.parse( unescape(value.toString()) ) );        

      });

    },
    // Get data from the API 
    function getFromAPI() {

      // get_category_index request from the external "WordPress API"
      rest.get(config.api.hostname + "/api/get_category_index/?lang="+lang).on("complete", function(data) {

        // Escapes and stringify the categories
        var categories = escape( JSON.stringify( data.categories ) );

        // Put the data in the cache 
        app.memcached.set('courses-list--'+lang, categories);

        // Call the complete function
        complete( data.categories );

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
      app.memcached.get('course--'+slug, function(err, value) {

        // Gets the colletion from the fallback function
        if(err != null ||  value == null || !value.length) fallback();
        // Parse the received string
        else complete( JSON.parse( unescape(value.toString()) ) );
      });
    },
    // Get data from the API 
    function getFromAPI() {

      // get_category_index request from the external "WordPress API"
      rest.get(config.api.hostname + "/category/"+slug+"?lang=auto&json=1&post_type=jquest_chapter&count=10000&order_by=parent&order=ASC").on("complete", function(data) {
        
        // Escapes and stringify the category
        var category = escape( JSON.stringify( data.category ) );

        // Put the data in the cache 
        app.memcached.set('course--'+slug, category);

        // Call the complete function
        complete( data.category );

      });
    }        
  ]);

};