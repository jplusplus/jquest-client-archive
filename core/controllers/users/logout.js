
/**
 * @author Pirhoo
 * @description Logout route binder
 *
 */
module.exports = function(app, sequelize) {
	/*
	 * GET user log out.
	 */
	app.get('/users/logout', function(req, res) {
		req.logout();
		res.redirect("/");
	});	
};