   var i18n = require("i18n")
   , config = require("config");

 /**
 * @author Pirhoo
 * @description Admin route binder
 *
 */
module.exports = function(app) {
  
  /*
   * GET home page.
   */
  app.get('/admin/courses', function(req, res){        

    switch(true) {

      case req.isUnauthenticated():
        res.redirect("/users/login");
        break;

      case req.user.ugroup != "admin":
        res.render('401');
        break;

      default :
        res.render("admin/courses", { iframeSrc : config.api.hostname + "/wp-admin" });
        break;

    }

  });

};