(function() {
	var app = angular.module('main.profile', [
		'ui.router'
	]);

	app.controller ( 'profileController', function profileController ($scope, $http, $window) {

		/*
			1. Check if logged in
			2. Get user name
			3. look up user config file on s3 to find boxes created and boxes collaborated
			4. Populate 2 different lists boxes created/collaborated
			5. Look up each box in each list for name of box, max items, current num items

			What happens if no user is logged on but they try to go to this page?
		*/
	});
})();
