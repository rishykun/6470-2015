(function() {
	var app = angular.module('main.signup', [
		'ui.growl',
		'ui.router'
	]);

	app.controller ( 'signupController', function signupController ($scope, $http, $window, $state, $modalInstance, $growl, UserProfile) {
		$scope.formData = {}; //default empty form object to be populated
		$scope.signModalTitle = "Sign Up"; //sets the title of the signin/signup modal window

		//sets factory services to be accessible from $scope
		$scope.userProfile = UserProfile;

		//redirects to the home page
		$scope.resetState = function (s) {
			//hacky way to prevent redirect unless we clicked outside the modal content window or the x button
			if (s.target.className === "modal fade font-gray ng-isolate-scope"
				|| s.target.className === "modal fade font-gray ng-isolate-scope in"
				|| s.currentTarget.className === "close") {
				$('.form-signup').trigger("reset"); //clears the signup form
				$state.go('home');
			}
		};

		$scope.closeModal = function() {
			$modalInstance.dismiss('cancel');
			$('.form-signup').trigger("reset"); //clears the signup form
		}

		//attempts authentication on the server with the credentials from the form
		$scope.signup = function () {
			if ($scope.formData.hasOwnProperty("email") && $scope.formData.hasOwnProperty("password")) {
				if ($scope.formData.email !== undefined && $scope.formData.email !== null
					&& $scope.formData.email !==""
					&& $scope.formData.password !== undefined && $scope.formData.password !== null
					&& $scope.formData.password !== "") {

					$("#signupForm :input").prop("disabled", true); //disable form while post request is handled

					$http.post('/signup', $scope.formData)
					.success (function(data) {
						$('.form-signup').trigger("reset"); //clears the signup form
						$("#signupForm :input").prop("disabled", false); //renable form
						$growl.box("Success", "Signed up", {
							class: "success"
						}).open();
						$scope.userProfile.loadProfile(true, 'setusername'); //try to load the userprofile
					})
					.error (function() {
						$("#signupForm :input").prop("disabled", false); //renable form
						$growl.box("Error", "Cannot register account to server", {
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
		};
	});
})();
