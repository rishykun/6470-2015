(function() {
	var app = angular.module('main.signup', [
		'ui.router'
	]);

	/*
	app.config(function signupConfig($stateProvider, $urlRouterProvider) {
		$stateProvider.state( 'signup', {
			url: '/',
			views: {
				'main': {
					controller: "signupController",
					templateUrl: ""
				}
			},
			data: {pageTitle: "Sign Up"}
		});
	});*/

	app.controller ( 'signupController', function signupController ($scope, $http, $window) {
		console.log("signupController used."); //debug

		$scope.formData = {}; //default empty form object to be populated

		$scope.$parent.signModalTitle = "Sign Up"; //sets the title of the signin/signup modal window

		//attempts authentication on the server with the credentials from the form
		$scope.signup = function () {
			if ($scope.formData !== $scope.emptyData) {
				$http.post('/signup', $scope.formData)
				.success (function(data) {
					//upon signup success, log in and load the profile
					$scope.getProfile();
				})
				.error (function() {
					console.log("Error registering account to server!");
				});
			}
		};
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
