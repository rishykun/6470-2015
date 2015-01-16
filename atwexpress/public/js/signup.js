(function() {
	var app = angular.module('main.signup', [
		'ui.router'
	]);


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
	});

	app.controller ( 'signupController', function signupController ($scope, $http, $window) {

		console.log("signupcontroller used"); //debug

		$scope.formData = {}; //default empty form object to be populated

		//attempts authentication on the server with the credentials from the form
		$scope.signup = function () {
			if ($scope.formData !== $scope.emptyData) {
				$http.post('/signup', $scope.formData)
				.success (function(data) {
					$http.get('/profile')
					.success (function(data) {
						//debug
						//idk if this if statement is necessary here
						if (data !== "") {
							//if the user is logged in
							$scope.setLogin(true);
							$scope.$parent.userObject = data;
							console.log("found profile");
							console.log(data);
							//user object
							//	user/email is data.local.email
						}
						else {
							console.log("profile data was empty");
						}
					})
					.error (function() {
						console.log("error getting profile");
					});
				})
				.error (function() {
					console.log("error registering account to server");
				});
			}
		};

		//resize function: on resize, always keep elements centered
		$('#signupLocallyButton').click(function() {
			//captures the height from $window using jquery
			var height = $(window).height();

			//quick hacky way to find dynamic position
			$('.modal').css("display","block");

			var signupModalHeight = $('#signupDialog').height();
			var signupBodyHeight = $('#signupBody').height();

			$('.modal').css("display","none");

			//same for signup modal
			$("#signupDialog").css("margin-top", (height-signupModalHeight)/2);
			$("#signupDialog").css("margin-left", "auto");
		});

		$(window).resize(function() {
			var newHeight = $(window).height();
			var signupModalHeight = $('#signupDialog').height();
			//console.log("new height: " + newHeight); //debug
			//console.log("signupModalHeight: " + signupModalHeight); //debug
			$("#signupDialog").css("margin-top", (newHeight-signupModalHeight)/2);
			$("#signupDialog").css("margin-left", "auto");
		});
	});


	app.directive('signupViewer',function(){
	    return {
		    replace : true,
		    restrict : 'E',
		    templateUrl: '../tpl/signup/signup.tpl.html'
	    }; 
	});
})();
