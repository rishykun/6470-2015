(function() {
	var app = angular.module('main.profile', [
		'ui.router'
	]);

	app.controller ( 'profileController', function profileController ($scope, $http, $window) {
		console.log("IN PROFILE CONTROLLER");
		console.log($scope.userConfig);
	});
})();
