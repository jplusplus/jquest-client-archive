var rest = require('restler')
 , async = require('async')
 , cache = require('memory-cache')
, config = require("config")
 , users = require("../users");

/**
 * @author Pirhoo
 * @description Chapters route binder
 *
 */
module.exports = function(app, sequelize) {

	/*
	 * GET chapters page.
	 */
	app.get('/chapters', function(req, res){
    // Redirects to the courses page (that clusters every chapters)
    req.redirect('/courses');
	});

};

/**
 * @author Pirhoo
 * @description Get a course using its slug
 */
module.exports.getChaptersByCourse = function(slug, lang, complete) {

  var cacheSlug = "chapters-list--" + lang + "-" + slug;

  async.series([
    // Get data from cache first
    function getFromCache(fallback) {      
      // Get the course from the cache
      if( !! cache.get(cacheSlug) ) complete( cache.get(cacheSlug) );
      // Or get the colletion from the fallback function
      else fallback();
    },
    // Get data from the API 
    function getFromAPI() {      

      // get_category_index request from the external "WordPress API"
      rest.get(config.api.hostname + "/category/" + slug + "/?lang=" + lang   + "&json=1&post_type=jquest_chapter&count=50&order_by=parent&order=ASC").on("complete", function(data) {
        

        // Put the data in the cache 
        cache.put(cacheSlug, data.posts || []);

        // Call the complete functions
        complete( data.posts  || []);

      });
    }        
  ]);

};

/**
 * @author Pirhoo
 * @description Get a chapter using its slug
 */
module.exports.getChapterBySlug = function(id, lang, complete) {

  var slug = "chapters--" + lang + "-" + id;

  async.series([
    // Get data from cache first
    function getFromCache(fallback) {      
      // Get the course from the cache
      if( !! cache.get(slug) ) complete( cache.get(slug) );
      // Or get the colletion from the fallback function
      else fallback();
    },
    // Get data from the API 
    function getFromAPI() {      

      // get_category_index request from the external "WordPress API"
      rest
        .get(config.api.hostname + "/jquest_chapter/" + id + "?json=get_post&post_type=jquest_chapter&lang="+lang)
        .on("complete", function(data) {
                    
          // Put the data in the cache 
          cache.put(slug, data.post || []);

          // Call the complete functions
          complete( data.post  || []);

        });
    }        
  ]);

};




/**
 * @function
 * Ordering chapters to Z order : 
 *    1,2,3, 4,5,6, 7,8,9, 10,11
 *  begins
 *    1,2,3, 6,5,4, 7,8,9, null,11,10
 * @return array
 */
module.exports.getZOrder = function(chapters) {

  var finalChapters = [];  

  // First, record the parent of every chapter
  for(var index in chapters) {
    if(index > 0) {
      chapters[index].parent = chapters[index-1].id;
    }
  }

  // Second, sets the Z order
  for(index = 0; index < chapters.length; index++) {

    for(step = 0; step < 3 && index + step < chapters.length; step++) {
      finalChapters.push( chapters[index + step] );
    }

    index += 3;
    if(index < chapters.length) {

      index += 2;

      for(step = 0; step < 3; step++) {
        if(index - step < chapters.length) 
          finalChapters.push( chapters[index - step] );
        else
          finalChapters.push( null );
      }
    }

  }

  return finalChapters;
} 