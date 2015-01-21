(function() {
	var app = angular.module('main.upload', [
		'ui.router'
	]);

	app.controller ( 'uploadController', function createController ($scope, $http, $window, Box) {
		$scope.box = Box;
		$scope.formData = {}; //default empty form object to be populated
	});
})();
