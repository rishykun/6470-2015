(function() {
	var app = angular.module('main.upload', [
		'ui.router'
	]);

	app.controller ( 'uploadController', function uploadController ($scope, $http, $window, $state, Box, Modal, $modal) {
		$scope.box = Box; //needed to set current box id

		//redirects to the profile page
		$scope.resetState = function (s) {
			//hacky way to prevent redirect unless we clicked outside the modal content window or the x button
			if (s.target.className === "modal fade font-gray ng-isolate-scope"
				|| s.target.className === "modal fade font-gray ng-isolate-scope in"
				|| s.currentTarget.className === "close") {
				$scope.box.clearCurrentBox(); //reset current box
				$state.go('profileview');
			}
		};
	});
})();
