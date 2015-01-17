(function() {
	var app = angular.module( "main", [
		'main.signin',
		'main.signup',
		'main.create',
		'main.profile',
		'ui.router'
	]);

	app.config (function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state( 'signin', {
				url: '/',
				templateUrl: "../tpl/signin/signin.tpl.html",
				controller: "signinController"
			})
			.state( 'signup', {
				url: '/',
				templateUrl: "../tpl/signup/signup.tpl.html",
				controller: "signupController"
			})
			.state( 'profileview', {
				url: '/',
				templateUrl: "../tpl/profile/profileviewer.tpl.html",
				controller: "profileController"
			})
			.state( 'upload', {
				url: '/',
				templateUrl: "../tpl/upload/upload.html",
			});
	});

	app.controller("MainController", function($scope, $window, $http, $state) {
		//------------ variable initialization
		$scope.loggedIn = false; //default

		//------------ controller functions
		//returns the login status
		$scope.isLoggedIn = function () {
			return $scope.loggedIn;
		}
		//hides all modal windows
		$scope.hideModals = function () {
			//close the login & signup modal
			$('#signModal').modal('hide');
			//close the create modal
			$('#createBoxModal').modal('hide');
		}
		//sets the login state to be true
		$scope.setLogin = function (loginStatus) {
			$scope.loggedIn = loginStatus;
			$scope.hideModals();
		}
		//gets the user profile from the server if properly authenticated already
		$scope.getProfile = function () {
			$http.get('/profile')
			.success (function(data) {
				if (data !== "") {
					//if the user is logged in
					$scope.setLogin(true);
					$scope.userObject = data;
					console.log("Found profile.");
					console.log(data);
					//user object
					//debug note: user/email is data.local.email
				}
				else {
					console.log("Profile data was empty.");
				}
			})
			.error (function() {
				console.log("Error getting profile!");
			});
		}
		//gets the contents of the specified box uri from the server
		$scope.getBoxContents = function (boxuri) {
			$http.post('/getbox', "{ 'uri' : '" +  boxuri + "' }")
				.success (function(data) {
					return data;
				})
				.error (function() {
					console.log("Error getting box contents for " + boxuri + "!");
				});
		}
		//sets the current box
		$scope.setCurrentBox = function (box) {
			$scope.currentBox = box;
			//gets the content of that box for the box-viewer
			var boxContents = $scope.getBoxContents(box.uri);
			//TODO update the box viewer with the contents of the box in 'boxContents'
		}
		//logs the user out from the server
		$scope.logout = function () {
			$http.get('/logout')
			.success (function(data) {
				console.log("Successfully logged out!");

				//clears the logged-in user profile in userObject
				$scope.userObject = {};
				$scope.setLogin(false);
			})
			.error (function() {
				console.log("Error logging out!");
			});
		};

		$scope.getProfile(); //we check if we are already logged in on the server
		//if we are, then load the user data into our profile, which is the userObject object

		//captures the height from $window using jquery
		var height = $(window).height();
		var buttonHeight = $('#createBtn').height();

		//quick hacky way to find dynamic position
		$('.modal').css("display","block");
		var createModalHeight = $('#createDialog').height();
		var loginModalHeight = $('#loginDialog').height();
		$('.modal').css("display","none");

		//vertically aligns the Create and Receive buttons in the center
		$('#buttonGroup').css("padding-top", (height-buttonHeight)/2);
		//same for create modal
		$("#createDialog").css("margin-top", (height-createModalHeight)/2);
		$("#createDialog").css("margin-left", "auto");

		//resize signup/login modal upon click
		$scope.signModalInitResize = function () {
			//quick hacky way to find dynamic position
			var cheight = $(window).height();
			var cdisplay = $('.modal').css("display");
			$('#signModal').css("display","block");
			var signModalHeight = $('#signDialog').height();
			$('#signModal').css("display",cdisplay);

			$("#signDialog").css("margin-top", (cheight-signModalHeight)/2);
			$("#signDialog").css("margin-left", "auto");
		};
		$('#loginButton').click(function() {
			$scope.signModalInitResize();
		});
		$('#signupButton').click(function() {
			$scope.signModalInitResize();
		});

		//resize function: on resize, always keep elements centered
		$(window).resize(function() {
			var newHeight = $(window).height();
			$('#buttonGroup').css("padding-top", newHeight / 2);
			$("#createDialog").css("margin-top", (newHeight-createModalHeight)/2);
			$("#createDialog").css("margin-left", "auto");

			//resize the login/signup modal
			var signModalHeight = $('#signDialog').height();
			$("#signDialog").css("margin-top", (newHeight-signModalHeight)/2);
			$("#signDialog").css("margin-left", "auto");
		});
	});
})();