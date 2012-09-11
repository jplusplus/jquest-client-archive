var rest = require('restler')
 , async = require('async')
, config = require("config")
 , users = require("../users");

// app global object
var app;

/**
 * @author Pirhoo
 * @description Chapters route binder
 *
 */
module.exports = function(_app) {  

  app = _app;

	/*
	 * GET chapters page.
	 */
	app.get('/chapters', function(req, res){
    // Redirects to the courses page (that clusters every chapters)
    res.redirect('/courses');
	});

};

/**
 * @author Pirhoo
 * @description Get a course using its slug
 */
module.exports.getChaptersByCourse = function(slug, complete) {

  var cacheSlug = "chapters-list--" + slug;

  async.series([
    // Get data from cache first
    function getFromCache(fallback) {
      // Get the chapters from the cache
      app.memcached.get(cacheSlug, function(err, value) {
        // Gets the chapters from the fallback function
        if(err != null || value == null || !value.length ) fallback();
        // Parse the received string
        else complete( JSON.parse( unescape(value.toString()) ) );
      });
    },
    // Get data from the API 
    function getFromAPI() {      
      // get_category_index request from the external "WordPress API"
      rest.get(config.api.hostname + "/category/" + slug + "/?json=1&post_type=jquest_chapter&count=50&order_by=parent&order=ASC").on("complete", function(data) {
        
        // Escapes and stringify the chapters
        var chapters = escape( JSON.stringify( data.posts || []) );

        // Put the data in the cache 
        app.memcached.set(cacheSlug, chapters);

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
module.exports.getChapterBySlug = function(id, complete) {

  var slug = "chapters--" + id;

  async.series([
    // Get data from cache first
    function getFromCache(fallback) {      
      // Get the chapter from the cache
      app.memcached.get(slug, function(err, value) {
        // Gets the chapter from the fallback function
        if(err != null ||  value == null || !value.length) fallback();
        // Parse the received string
        else complete( JSON.parse( unescape(value.toString()) ) );
      });
    },
    // Get data from the API 
    function getFromAPI() {      

      // get_category_index request from the external "WordPress API"
      rest
        .get(config.api.hostname + "/?json=get_post&post_type=jquest_chapter&slug="+id)
        .on("complete", function(data) {
          
          // Escapes and stringify the chapter
          var chapter = escape( JSON.stringify( data.post || []) );

          // Put the data in the cache 
          app.memcached.set(slug, chapter);

          // Call the complete functions
          complete( data.post  || []);

        });
    }        
  ]);

};

/**
 * Finds the next chapter
 * @param  {Object} chapter  Current chapter
 * @param  {Function} complete Callback function (async style)
 */
module.exports.getNextChapter = function(chapter, complete) {

  // Find all the chapter for the current course
  module.exports.getChaptersByCourse(chapter.categories[0].slug, function(chapters) {

    var next = null;

    // Find the chapter that has the current as parent
    for(var index in chapters) {
      next = chapters[index].parent && chapters[index].parent == chapter.id ? chapters[index] : next;
    }
    
    if(typeof complete === "function") complete(null, next);    

  });

};


/**
 * @function
 * Ordering chapters to Z order : 
 *    1,2,3, 4,5,6, 7,8,9, 10,11
 *  begins
 *    1,2,3, 6,5,4, 7,8,9, null,11,10
 * @return array
 */
module.exports.getZOrder = function(chapters, lineLength) {

  var finalChapters = [];      
  if(typeof lineLength !== "number") lineLength = 2;

  // First, record the parent of every chapter
  for(var index in chapters) {
    if(index > 0) {
      chapters[index].parent = chapters[index-1].id;
    }
  }

  // Second, sets the Z order
  for(index = 0; index < chapters.length; index++) {

    for(step = 0; step < lineLength && index + step < chapters.length; step++) {
      finalChapters.push( chapters[index + step] );
    }

    index += lineLength;
    if(index < chapters.length) {

      index += lineLength-1;

      for(step = 0; step < lineLength; step++) {
        if(index - step < chapters.length) 
          finalChapters.push( chapters[index - step] );
        else
          finalChapters.push( null );
      }
    }

  }

  return finalChapters;
} 