(function() {
	var app = angular.module('main.signup', [
		'ui.router'
	]);

	app.controller ( 'signupController', function signupController ($scope, $http, $window, $state, Auth, UserProfile) {
		$scope.formData = {}; //default empty form object to be populated
		$scope.signModalTitle = "Sign Up"; //sets the title of the signin/signup modal window

		//sets factory services to be accessible from $scope
		$scope.auth = Auth;
		$scope.userProfile = UserProfile;

		//redirects to the home page
		$scope.resetState = function (s) {
			console.log(s);
			//hacky way to prevent redirect unless we clicked outside the modal content window or the x button
			if (s.target.className === "modal fade font-gray ng-isolate-scope"
				|| s.target.className === "modal fade font-gray ng-isolate-scope in"
				|| s.currentTarget.className === "close") {
				$state.go('redirectfromloginorlogout');
			}
		};

		$scope.closeModal = function() {
			$modalInstance.dismiss('cancel');
		}

		//attempts authentication on the server with the credentials from the form
		$scope.signup = function () {
			if ($scope.formData.hasOwnProperty("email") && $scope.formData.hasOwnProperty("password")) {
				if ($scope.formData.email !== undefined && $scope.formData.email !== null
					&& $scope.formData.email !==""
					&& $scope.formData.password !== undefined && $scope.formData.password !== null
					&& $scope.formData.password !== "") {
					$http.post('/signup', $scope.formData)
					.success (function(data) {
						$('.form-signup').trigger("reset"); //clears the signup form
						$.growl("Signup successful", {
							type: "success",
							animate: {
								enter: 'animated fadeInRight',
								exit: 'animated fadeOutRight'
							}
						});
						$scope.userProfile.loadProfile(true); //try to load the userprofile
					})
					.error (function() {
						$.growl("Error registering account to server", {
							type: "danger",
							animate: {
								enter: 'animated fadeInRight',
								exit: 'animated fadeOutRight'
							}
						});
					});
				}
				else {
					$.growl("Form is empty", {
						type: "info",
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
				}
			}
			else {
				$.growl("Form is empty", {
					type: "info",
					animate: {
						enter: 'animated fadeInRight',
						exit: 'animated fadeOutRight'
					}
				});
			}
		};

		//$scope.signModalInitResize(); //guarantees the resize of the signin/signup modal window when shown
	});
})();
