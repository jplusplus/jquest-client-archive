
/**
 * @author Pirhoo
 * @description Logout route binder
 *
 */
module.exports = function(app, db) {
	/*
	 * GET user log out.
	 */
	app.get('/user/logout', function(req, res) {
		delete req.session.currentUser;
		res.redirect("/");
	});	
};