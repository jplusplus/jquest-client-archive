var i18n = require('i18n')
    , fs = require('fs')
  , api = require('../api');

/**
 * @author Pirhoo
 * @description post controller
 *
 */
module.exports = function(_app) {
  
  app = _app; 

  app.get("/:lang/p/:uid", function(req, res) { 

    // Template file 
    var tpl = "posts/",
    // Extended template file
    extendedTpl = app.get("views") + "/" + tpl + req.params.uid + "." + app.get("view engine");
    // Use a sub template ?
    tpl = fs.existsSync(extendedTpl) ? tpl + req.params.uid : tpl;


    getPost(req.params.uid, i18n.getLocale(req), function(err, post) {        
      // We found the post
      if(err == null && post) res.render(tpl, post); 
      // Try to get the post in english
      else if(i18n.getLocale(req) != "en") {
        getPost(req.params.uid, "en", function(err, post) { 
          // We found the post
          if(err == null && post) res.render(tpl, post); 
          // No post found
          else res.render("404");
        });      
      // No post found
      } else res.render("404");
    });

  });

};

/**
 * @author Pirhoo
 * @description Get a post using its slug or id (polymorph)
 */
var getPost = module.exports.getPost = function(uid, lang, complete) {

    // Request option
    var params = {
      lang     :  lang
    };

    // Determines wich argument use to retreive the post
    params[ isNaN(uid) ? "slug" : "id" ] = uid;    

    // Gets data from the api
    api.post(params).get(function(err, data) {
      
      if(err || data.objects.length == 0) {
        return complete({error: "post not found."}, null)
      }

      // Return the first item of the dataset
      complete(null, data.objects[0]);

    })
};

/**
 * Replace every given variables by its value in the string.
 * @param  {Object} vars Variables to look for.
 * @param  {String} str  String to parse.
 * @return {String} String parsed.
 */
module.exports.parsePage = function(vars, str) {

  // For each var
  for(var index in vars) {    
    // Replace its value in the string
    str = str.replace( new RegExp("{{" + index + "}}", "gi"), vars[index]);
  }

  return str;
};
