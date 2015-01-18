(function() {
	var app = angular.module('main.create', [
		'ui.router'
	]);

	app.controller ( 'createController', function createController ($scope, $http, $window) {
		$scope.boxData = {}; //default empty form object to be populated
		$scope.emptyData = {}; //empty object definition

		//attempts authentication on the server with the credentials from the form
		$scope.createBox = function () {
			if ($scope.boxData !== $scope.emptyData) {
				$http.post('/getbox', $scope.boxData)
				.success (function(data) {
					$scope.setCurrentBox(data);
					$('.form-create').trigger("reset"); //clears the signin form
					$scope.hideModals();
					$("#uploadBoxModal").modal('show');
					//hacky
					$("<a href='/uploading'></a>").click();
				})
				.error (function() {
					console.log("Error retrieving box!");
				});
			}
			else {
				console.log("No box data!"); //debug
			}
		};
	});
})();
