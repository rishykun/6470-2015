(function() {
	var app = angular.module('main.settings', [
		'ui.growl',
		'ui.router'
	]);

	app.controller ( 'settingsController', function settingsController ($scope, $http, $state, $window, $growl, UserProfile) {
		$scope.userProfile = UserProfile;
		$scope.formData = {};

		//updates the user configuration with the new username
		$scope.changeUsername = function () {
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
							$growl.box("Success", "Set the username", {
								class: "success"
							}).open();
							$scope.userProfile.loadProfile(false, 'settings');
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

		$scope.toggleEmailVisibility = function () {
			$scope.showEmailObj = {
				showemail: !$scope.userProfile.getProfile().showEmail
			};
			$http.post('/toggleshowemail', $scope.showEmailObj)
			.success(function(data) {
				$growl.box("Success", "Toggled email visibility", {
					class: "success"
				}).open();
				$scope.userProfile.loadProfile(false, 'settings');
			})
			.error(function() {
				$growl.box("Error", "Cannot toggle email visibility", {
					class: "danger"
				}).open();
			});
		};
	});
})();
