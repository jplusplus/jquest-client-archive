
/**
 * @author Pirhoo
 * @description Logout route binder
 *
 */
module.exports = function(app, sequelize) {
	/*
	 * GET user log out.
	 */
	app.get('/:lang/u/logout', function(req, res) {

        // Redirect to the right language
        require("../url").checkLanguage(req, res);

		req.logout();
		res.redirect("/");
	});	
};