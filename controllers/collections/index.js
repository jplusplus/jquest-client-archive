var rest = require('restler')
 , async = require('async')
 , cache = require('memory-cache');

/**
 * @author Pirhoo
 * @description Topics route binder
 *
 */
module.exports = function(app, sequelize) {

	/*
	 * GET topics page.
	 */
	app.get('/collections', function(req, res){

    module.exports.getCollections(function(collections) {

      res.render('collections', 
        {
          title: 'jQuest',
          stylesheets: [
            "/stylesheets/vendor/bootstrap-build/bootstrap.min.css",
            "/stylesheets/vendor/bootstrap-build/bootstrap-responsive.min.css",
            "http://fonts.googleapis.com/css?family=Share:400,700",
            "/stylesheets/style.less"
          ], 
          javascripts: [
            "/javascripts/vendor/bootstrap/bootstrap.min.js"                
          ],
          collections: collections
        }
      );

    });

	});

};


/**
 * @author Pirhoo
 * @description Get the collections from the API or from the cache
 */
module.exports.getCollections = function(complete) {

  async.series([
    // Get data from cache first
    function getFromCache(fallback) {
      // Get the collection from the cache
      if( cache.get('collections-list') ) complete( cache.get('collections-list') );
      // Or get the colletion from the fallback function
      else fallback();
    },
    // Get data from the API 
    function getFromAPI() {

      // get_category_index request from the external "WordPress API"
      rest.get("http://jquest.oeildupirate.dev/api/get_category_index/").on("complete", function(data) {

        var collections = [];
        // Filters the data (collections are categories in WordPress)
        for(var i in data.categories) {
          // Category must be a child of the "collections" category
          if( data.categories[i].parent === 3 ) {
            // So records it
            collections.push( data.categories[i] );
          }          
        }

        // Put the data in the cache 
        cache.get('collections-list', collections);

        // Call the complete function
        complete( collections );

      });
    }        
  ]);

};