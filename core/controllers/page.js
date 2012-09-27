   var rest = require('restler')
    , async = require('async')
   , config = require("config");

/**
 * @author Pirhoo
 * @description Page controller
 *
 */
module.exports = function(_app) {
  
  app = _app; 

  app.get("/page/:uid", function(req, res) { 

    // Get and update the language
    res.cookie("language", require("./users").getUserLang(req));

    module.exports.getPage(req.params.uid, req.cookies.language, function(page) {              
      // We found the page
      if(page) res.render("page", page); 
      // No page found
      else     res.render("404");
    });

  });

};

/**
 * @author Pirhoo
 * @description Get a page using its slug or id (polymorph)
 */
module.exports.getPage = function(uid, lang, complete) {

  // Unique slug used by the cache to retreive the page
  var cacheSlug = 'page--' + lang + "--" + uid;

  async.series([
    // Get data from cache first
    function getFromCache(fallback) {     

      // Get the course from the cache
      app.memcached.get(cacheSlug, function(err, value) {

        // Gets the colletion from the fallback function
        if(err != null ||  value == null || !value.length) fallback();
        // Parse the received string
        else complete( JSON.parse( unescape(value.toString()) ) );
      });
    },
    // Get data from the API 
    function getFromAPI() {
  
      // Request option
      var options = {
        query: {
          json     : "get_page",
          lang     :  lang
        }
      };

      // Determines wich argument use to retreive the page
      options.query[ isNaN(uid) ? "slug" : "id" ] = uid;

      // get_category_index request from the external "WordPress API"
      rest.get(config.api.hostname, options).on("complete", function(data) {  
        
        // Escapes and stringify the page
        var page = escape( JSON.stringify( data.page ) );

        // Put the data in the cache 
        app.memcached.set(cacheSlug, page);

        // Call the complete function
        complete( data.page );
      });

    }        
  ]);

};