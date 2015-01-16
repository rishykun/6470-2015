(function() {
	var app = angular.module('main.signin', [
		'ui.router'
	]);


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
	});

	app.controller ( 'signinController', function signinController ($scope, $http, $window) {
		$scope.formData = {}; //default empty form object to be populated

		//we check if we are already logged in on the server and proceed accordingly
		$http.get('/profile')
		.success (function(data) {
			if (data !== "") {
				//if the user is logged in
				$scope.setLogin(true);
				$scope.$parent.userObject = data;
				//user object
				//debug note: user/email is data.local.email
			}
			else {
				console.log("profile data was empty");
			}
		})
		.error (function() {
			console.log("error getting profile");
		});

		//attempts authentication on the server with the credentials from the form
		$scope.login = function () {
			if ($scope.formData !== $scope.emptyData) {
				$http.post('/login', $scope.formData)
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
					console.log("error authenticating to server");
				});
			}
		};

		//resize function: on resize, always keep elements centered
		$('#loginLocallyButton').click(function() {
			//captures the height from $window using jquery
			var height = $(window).height();

			//quick hacky way to find dynamic position
			$('.modal').css("display","block");

			var loginModalHeight = $('#loginDialog').height();
			var signInBodyHeight = $('#signInBody').height();

			$('.modal').css("display","none");

			//same for login modal
			$("#loginDialog").css("margin-top", (height-loginModalHeight)/2);
			$("#loginDialog").css("margin-left", "auto");
		});

		$(window).resize(function() {
			var newHeight = $(window).height();
			var loginModalHeight = $('#loginDialog').height();
			//console.log("new height: " + newHeight); //debug
			//console.log("loginModalHeight: " + loginModalHeight); //debug
			$("#loginDialog").css("margin-top", (newHeight-loginModalHeight)/2);
			$("#loginDialog").css("margin-left", "auto");
		});
	});


	app.directive('signinViewer',function(){
	    return {
		    replace : true,
		    restrict : 'E',
		    templateUrl: '../tpl/signin/signin.tpl.html'
	    }; 
	});
})();
