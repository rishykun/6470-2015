(function() {
	var app = angular.module('main.signin', [
		'ui.router'
	]);

	app.controller ( 'signinController', function signinController ($scope, $http, $window) {
		$scope.formData = {}; //default empty form object to be populated
		$scope.emptyData = {}; //empty object definition
		$scope.$parent.signModalTitle = "Login"; //sets the title of the signin/signup modal window

		//attempts authentication on the server with the credentials from the form
		$scope.login = function () {
			if ($scope.formData !== $scope.emptyData) {
				$http.post('/login', $scope.formData)
				.success (function(data) {
					$('.form-signin').trigger("reset"); //clears the signin form
					$scope.getProfile(); //log in and load the profile
				})
				.error (function() {
					console.log("Error authenticating to server!");
				});
			}
			else {
				console.log("Form is empty!"); //debug
			}
		};

		$scope.signModalInitResize(); //guarantees the resize of the signin/signup modal window when shown
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
