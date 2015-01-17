(function() {
	var app = angular.module('main.create', [
		'ui.router'
	]);

	app.controller ( 'createController', function createController ($scope, $http, $window) {
		$scope.formData = {}; //default empty form object to be populated
		$scope.emptyData = {}; //empty object definition

		//attempts authentication on the server with the credentials from the form
		$scope.createBox = function () {
			if ($scope.formData !== $scope.emptyData) {
				$http.post('/create', $scope.formData)
				.success (function(data) {
					$scope.setCurrentBox(data);
					$('.form-create').trigger("reset"); //clears the signin form
					$scope.hideModals();
				})
				.error (function() {
					console.log("Error creating a box!");
				});
			}
			else {
				console.log("Form is empty!"); //debug
			}
		};
	});
})();
