var coursesCtrl = require('../courses')
 , chaptersCtrl = require('./index')
        , async = require('async')
       , config = require("config")
        , users = require("../users");

/**
 * @author Pirhoo
 * @description Chapter route binder
 *
 */
module.exports = function(app, sequelize) {

  /*
   * GET chapter page.
   */
  app.get(/^\/(courses|cours)\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/mission$/, function(req, res){

    var course_slug  = req.params[1],
        chapter_slug = req.params[2]; 

    // Get and update the language
    res.cookie("language", users.getUserLang(req) );

    async.parallel([
      // Finds the course
      function getCourse(callback) {
        // There is a function for that.
        coursesCtrl.getCourseBySlug(course_slug, function(course) {         
          
          // Next step...
          callback(null, course);

        });
      },
      // Finds the chapter with the given slug
      function getChapter(callback) {

        // Get chapter ? There is also a function for that
        chaptersCtrl.getChapterBySlug(chapter_slug, function(chapter) {

          // This is the end (my only friend).
          callback(null, chapter);

        });
      }   
    ], function render(error, results) {

        // Switchs to the 404 page if an error happends
        if( !results
        || results.length < 2 
        || results[0] === undefined 
        || results[1] === undefined) return res.render('404'); 

        // Render on the course view
        res.render('chapters/mission', {        
          title:    "Mission ‹ " +  results[1].title + " ‹ " + results[0].title,
          course:   results[0],
          chapter:  results[1]
        });
    });


  });

};