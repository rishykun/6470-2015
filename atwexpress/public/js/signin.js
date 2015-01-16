(function() {
	var app = angular.module('main.signin', [
		'ui.router'
	]);

	/*
	app.config(function SigninConfig($stateProvider, $urlRouterProvider) {		
		$stateProvider.state( 'signin', {
			url: '/',
			views: {
				'main': {
					controller: "signinController",
					templateUrl: ""
				}
			},
			data: {pageTitle: "Sign In"}
		});
	});*/

	app.controller ( 'signinController', function signinController ($scope, $http, $window) {
		console.log("signinController used."); //debug

		$scope.formData = {}; //default empty form object to be populated

		$scope.$parent.signModalTitle = "Login"; //sets the title of the signin/signup modal window

		//attempts authentication on the server with the credentials from the form
		$scope.login = function () {
			if ($scope.formData !== $scope.emptyData) {
				$http.post('/login', $scope.formData)
				.success (function(data) {
					//upon login success, log in and load the profile
					$scope.getProfile();
				})
				.error (function() {
					console.log("Error authenticating to server!");
				});
			}
		};
	});

	//deprecated
	app.directive('signinViewer',function(){
	    return {
		    replace : true,
		    restrict : 'E',
		    templateUrl: '../tpl/signin/signin.tpl.html'
	    }; 
	});
})();
