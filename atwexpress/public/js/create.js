(function() {
	var app = angular.module('main.create', [
		'ui.router'
	]);

	app.controller ( 'createController', function createController ($scope, $http, $window) {
		$scope.formData = {}; //default empty form object to be populated
		$scope.emptyData = {}; //empty object definition

		//debug
		$scope.getItem = function (boxuri, itemname) {
			boxuri = "6.470/Boxes/6071e388-544d-4861-a877-e5107bed050b"; //debug
			itemname = "batman.mp4"; //debug
			reqData = {
				'uri':  boxuri,
				'key': itemname
			}
			//DEBUG
			$http.post('/getitem', reqData)
			.success (function(data) {
				console.log("success getting item"); //debug
				console.log(data); //debug
			})
			.error (function() {
				console.log("Error getting item!");
			});
			//END DEBUG
		};

		//debug
		$scope.getBox = function () {
			//DEBUG
			$http.post('/getbox', "{}")
			.success (function(data) {
				console.log("success getting box"); //debug
				console.log(data); //debug
				
			})
			.error (function() {
				console.log("Error getting box contents!");
			});
			//END DEBUG
		};

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
