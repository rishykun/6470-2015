(function() {
	var app = angular.module('main.signup', [
		'ui.router'
	]);

	app.controller ( 'signupController', function signupController ($scope, $http, $window) {
		console.log("signupController used."); //debug

		$scope.formData = {}; //default empty form object to be populated
		$scope.$parent.signModalTitle = "Sign Up"; //sets the title of the signin/signup modal window

		//attempts authentication on the server with the credentials from the form
		$scope.signup = function () {
			if ($scope.formData !== $scope.emptyData) {
				$http.post('/signup', $scope.formData)
				.success (function(data) {
					$('.form-signup').trigger("reset"); //clears the signup form
					$scope.getProfile(); //log in and load the profile
				})
				.error (function() {
					console.log("Error registering account to server!");
				});
			}
		};

		$scope.signModalInitResize(); //guarantees the resize of the signin/signup modal window when shown
	});

	//deprecated
	app.directive('signupViewer',function(){
	    return {
		    replace : true,
		    restrict : 'E',
		    templateUrl: '../tpl/signup/signup.tpl.html'
	    }; 
	});
})();
