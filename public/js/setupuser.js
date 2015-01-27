(function() {
	var app = angular.module('main.setupuser', [
		'ui.growl',
		'ui.router'
	]);

	app.controller ("setupuserController", ["$scope", "$window", "$http", "$state", "$modalInstance", "$growl", "Modal", "UserProfile", "Box",
		function setupuserController ($scope, $window, $http, $state, $modalInstance, $growl, Modal, UserProfile, Box) {
		$scope.userProfile=UserProfile;
		$scope.box = Box;
		$scope.modal = Modal;
		$scope.formData = {};

		//redirects to the home page
		$scope.resetState = function (s) {
			//hacky way to prevent redirect unless we clicked outside the modal content window or the x button
			if (s.target.className === "modal fade font-gray ng-isolate-scope"
				|| s.target.className === "modal fade font-gray ng-isolate-scope in"
				|| s.currentTarget.className === "close") {
				$('.form-setusername').trigger("reset"); //clears the create form
				$state.go('home');
			}
		};

		$scope.closeModal = function() {
			$modalInstance.dismiss('cancel');
			$('.form-setusername').trigger("reset"); //clears the create form
		}

		//updates the user configuration with the new username
		$scope.setUsername = function () {
			if ($scope.userProfile.isLoggedIn()) {
				email = $scope.userProfile.getProfile().local.email;
				$scope.formData.email = email;
				if ($scope.formData.hasOwnProperty("username")) {
					if ($scope.formData.username !== undefined && $scope.formData.username !== null
						&& $scope.formData.username !== "") {
						//needs to send email as well
						$("#usernameForm :input").prop("disabled", true); //disable form while post request is handled
						$http.post('/setupusername', $scope.formData)
						.success (function(data) {
							$('.form-setusername').trigger("reset"); //clears the create form
							$("#usernameForm :input").prop("disabled", false); //renable form
							$scope.modal.closeModal();
							$growl.box("Success", "Set the username", {
								class: "success"
							}).open();
							$scope.userProfile.loadProfile(false, 'home');
						})
						.error (function() {
							$("#usernameForm :input").prop("disabled", false); //renable form
							$growl.box("Error", "Cannot set username", {
								class: "danger"
							}).open();
						});
					}
					else {
						$growl.box("Warning", "Empty form", {
							class: "warning"
						}).open();
					}
				}
				else {
					$growl.box("Warning", "Empty form", {
						class: "warning"
					}).open();
				}
			}
			else {
				$growl.box("Warning", "Please login or signup to set the username", {
					class: "warning"
				}).open();
			}
		};
	}]);
})();