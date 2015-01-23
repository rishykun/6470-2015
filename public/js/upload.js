(function() {
	var app = angular.module('main.upload', [
		'ui.router'
	]);

	app.controller ( 'uploadController', function uploadController ($scope, $http, $window, Box, Modal, $modal) {
		$scope.box = Box;
	});
})();
