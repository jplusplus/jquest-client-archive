var config = require("config"), 
    i18n   = require("i18n"),
    app;

/**
 * @author Pirhoo
 * @description Language contr
 *
 */
module.exports = function(_app) {

    app = _app;

    /*
     * GET home page.
     */
    app.get('/lang/:ln', function(req, res) {        
        i18n.setLocale(req, req.params.ln.toLowerCase);       
        res.redirect(req.query.path || "back" || "/");
    });

};
