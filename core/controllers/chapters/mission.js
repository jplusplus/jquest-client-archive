var coursesCtrl = require('../courses')
 , chaptersCtrl = require('./index')
    , usersCtrl = require("../users")
        , async = require('async')
       , config = require("config");

// app global object
var app;

/**
 * @author Pirhoo
 * @description Chapter route binder
 *
 */
module.exports = function(_app) {

  // App global object
  app = _app;

  /*
   * All requests on a mission
   */
  app.all(/^\/(courses|cours)\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/mission$/, function(req, res){


    var course_slug  = req.params[1],
        chapter_slug = req.params[2],
        // Needs to be accessible in all functions of the serie
        chapter;  

    async.series({
      // Finds the course
      course : function(callback) {
        // There is a function for that.
        coursesCtrl.getCourseBySlug(course_slug, function(course) {         
          
          // Next step...
          callback(null, course);

        });
      },
      // Finds the chapter with the given slug
      chapter : function(callback) {

        // Get chapter ? There is also a function for that
        chaptersCtrl.getChapterBySlug(chapter_slug, function(chap) {

          // We have to save the chapter into another variable 
          // for the next step of that serie
          chapter = chap;

          // This is the end (my only friend).
          callback(null, chap);

        });
      },
      // Create a temporary user if the visitor isn't loged in
      user: function(callback) {
        usersCtrl.createTemporaryUser(req, callback);
      },
      // Finds the mission for this chapter
      mission: function(callback) {

        // Useless to look for the mission if the user is not loged in
        if(! req.user) return callback(null, null);
          
        // Future mission instance
        var mission = module.exports.getMission(req.user.id, chapter.id);

        // If we didn't find the mission but the mission class is available
        if(mission === false) {

          // Instances the mission 
          // (uses the chapter slug to find the good one) 
          // and call the render callback
          mission = new app.missions[chapter.slug](app.models, req.user.id, chapter.id, function() {            
            // Add this instance to the list of available instances
            app.userMissions.push(this);    
            // Final callback                    
            callback(null, this);
          }); 

        } else {
          // Prepare the mission to play
          mission.prepare(req, res, function() { callback(null, mission) });
        }

      },
      // Finds the user progression for the parent of this chapter
      parentUserProgression : function(callback) {

        // No user, we stop now
        if(!req.user || !chapter.parent || chapter.parent == null) return callback(null, null);

        app.models.UserProgression.find({ 
          where: { 
            userId    : req.user.id,
            chapterId : chapter.parent
          }
        // Request complete
        }).complete(callback);
      },
      // Finds the next chapter (when the mission is done)
      nextChapter: function(callback) {
        chaptersCtrl.getNextChapter(chapter, callback);
      }
    // Final callback 
    }, function(error, results) {
      module.exports.missionRender(error, results, req, res);
    });

  });

};

module.exports.missionRender = function (error, data, req, res) {

  // Switchs to the 404 page if an error happends
  if( !data
  || data.course      === undefined 
  || data.chapter     === undefined
  || data.mission     === undefined
  || data.nextChapter === undefined) return res.render('404');

  if( ! usersCtrl.isAllowed(data.chapter, req.user, data.parentUserProgression) ) {
    res.render('401'); // Authentification required !
    return;
  }

  // Change the render following the method
  if(req.method === "POST") {
    
      switch(data.mission.state) {

        // We lost the mission      
        case "failed":
          // Open the mission again
          data.mission.open(function() {
            // Redirect to the mission without POST data
            res.redirect(req.url);
          });
          break;

        default:
          // Redirect to the mission without POST data
          res.redirect(req.url);  
      }

  } else {       

    // Render on the course view
    res.render('chapters/mission', {
      title         : "Mission ‹ " +  data.chapter.title + " ‹ " + data.course.title,
      templatePath  : app.settings.views + "/chapters/mission/",
      course        : data.course,
      chapter       : data.chapter,
      nextChapter   : data.nextChapter,
      mission       : data.mission
    });

  }

}

/**
 * Get a mission instance for the given user and chapter
 * @param  {Number} userId
 * @param  {Number} chapterId
 * @return {Object} The mission instance, false if not found
 */
module.exports.getMission = function(userId, chapterId) {

  var mission = false;

  // Create the missions array if unexists
  if(typeof app.userMissions == "undefined") app.userMissions = [];   

  // Looks for the mission for this chapter and user
  app.userMissions.forEach(function(m) {
    
    // Chapter and user must be the same  
    if( m.chapterId == chapterId
    &&  m.userId    == userId ) {
      mission = m;
    }
  });

  return mission;
}