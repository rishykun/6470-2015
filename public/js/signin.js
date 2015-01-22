(function() {
	var app = angular.module('main.signin', [
		'ui.growl',
		'ui.router',
	]);

	app.controller ( 'signinController', function signinController ($scope, $http, $window, $state, $modalInstance, $growl, Auth, UserProfile) {
		$scope.formData = {}; //default empty form object to be populated
		$scope.signModalTitle = "Login"; //sets the title of the signin/signup modal window

		//sets factory services to be accessible from $scope
		$scope.auth = Auth;
		$scope.userProfile = UserProfile;

		//redirects to the home page
		$scope.resetState = function (s) {
			//hacky way to prevent redirect unless we clicked outside the modal content window or the x button
			if (s.target.className === "modal fade font-gray ng-isolate-scope"
				|| s.target.className === "modal fade font-gray ng-isolate-scope in"
				|| s.currentTarget.className === "close") {
				$('.form-signin').trigger("reset"); //clears the signin form
				$state.go('home');
			}
		};

		$scope.closeModal = function() {
			$modalInstance.dismiss('cancel');
			$('.form-signin').trigger("reset"); //clears the signin form
		}

		//attempts authentication on the server with the credentials from the form
		$scope.login = function () {
			if ($scope.formData.hasOwnProperty("email") && $scope.formData.hasOwnProperty("password")) {
				if ($scope.formData.email !== undefined && $scope.formData.email !== null
					&& $scope.formData.email !==""
					&& $scope.formData.password !== undefined && $scope.formData.password !== null
					&& $scope.formData.password !== "") {

					$("#signinForm :input").prop("disabled", true); //disable form while post request is handled

					$http.post('/login', $scope.formData)
					.success (function(data) {
						$('.form-signin').trigger("reset"); //clears the signin form
						$("#signinForm :input").prop("disabled", false); //renable form
						$growl.box("Success", "Logged in", {
							class: "success"
						}).open();
						UserProfile.loadProfile(true); //try to load the userprofile
					})
					.error (function() {
						$("#signinForm :input").prop("disabled", false); //renable form
						$growl.box("Error", "Cannot authenticate to server", {
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
