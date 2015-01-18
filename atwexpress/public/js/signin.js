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
					$.growl("Login successful", {
						type: "success",
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
					$scope.getProfile(false); //try to load the userprofile
				})
				.error (function() {
					$.growl("Error authenticating to server", {
						type: "danger",
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
				});
			}
			else {
				$.growl("Form was empty", {
						type: "info",
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
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
