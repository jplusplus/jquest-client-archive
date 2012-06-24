/**
 * @author Pirhoo
 * @description Login route
 *
 */
module.exports = function(app, db) {

	/*
	 * GET user login page.
	 */
	app.get('/user/login', loginPage);

	/*
	 * POST user login page.
	 */
	app.post('/user/login', loginPage);

};


function loginPage (req, res){

	if( req.param('email', false) )
		loadUser(req, res, loginForm);
	else
		loginForm(req, res);
}


function loginForm(req, res){

	// Redirects logged users
	if(req.session.currentUser) return res.redirect("/");	

	var params = { 
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
		email: req.param('email', false)
	};

	res.render('user/login.jade', params);
}


function loadUser(req, res, callback) {

	//error handling omitted
	var query = db.query("SELECT * FROM jquest_user WHERE ( email=$1 OR username=$1 ) AND password=crypt($2, password)", [ req.param('email'), req.param('password') ] );
	
	// for each row
	query.on("row", function(row, result) {
		result.rows.push(row);
	});

	// when we reach the end of the fetching
	query.on("end", function(result) {

		// register the user
		if(result.rows.length > 0) req.session.currentUser = result.rows[0];

	 	if(typeof callback === "function") callback(req, res);
	});

	// error appends
	query.on("error", function(error) {
		if(typeof callback === "function") callback(req, res);
	});

}