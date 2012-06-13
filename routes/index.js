
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index.jade', 
		{ 
			title: 'jQuest', 
			stylesheets: [
				"/stylesheets/vendor/bootstrap-build/bootstrap.min.css",
				"/stylesheets/vendor/bootstrap-build/bootstrap-responsive.min.css",
				"/stylesheets/style.less"
			], 
			javascripts: []
		}
	);
};