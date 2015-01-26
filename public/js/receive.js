(function() {
	var app = angular.module('main.receive', [
		'ui.growl',
		'ui.router'
	]);

	app.controller ("receiveController", ["$scope", "$window", "$http", "$state", "$growl", "UserProfile", "Box",
		function receiveController ($scope, $window, $http, $state, $growl, UserProfile, Box) {
		$scope.userProfile=UserProfile;
		$scope.box = Box;

		if ($scope.userProfile.isLoggedIn()) {
			if (!$scope.box.isBoxSet()) {
				//$("#receiveButton :input").prop("disabled", true); //disable button while get request is handled
				$http.get('/receivebox')
				.success (function(data) {
					console.log(data); //debug
					$scope.boxid = data.boxid;
					console.log($scope.boxid); //debug
					
					$scope.box.setCurrentBoxID($scope.boxid, true);
					
					//TODO DEBUG do check at this point to make sure we can upload to box before going to uploads
					//$("#receiveButton :input").prop("disabled", false); //renable button
					$growl.box("Success", "Retrieved a box from the server", {
						class: "success"
					}).open();
					$state.go('upload');
				})
				.error (function() {
					$("#receiveButton :input").prop("disabled", false); //renable button
					$growl.box("Error", "Cannot receive a box from the server. Try again later", {
						class: "danger"
					}).open();
					$state.go('home');
				});
			}
			else {
				$growl.box("Error", "Current box set already", {
					class: "danger"
				}).open();
			}
		}
		else {
			$growl.box("Warning", "Please login or signup to use the receive button", {
				class: "warning"
			}).open();
		}
	}]);
})();
