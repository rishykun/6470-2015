(function() {
	var app = angular.module( "main", [
		'main.signin',
		'main.signup',
		'main.create',
		'main.profile',
		'main.gallery',
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
				templateUrl: "../tpl/upload/upload.tpl.html",
				//controller: "uploadController"
			});
	});

	app.controller("MainController", function($scope, $window, $http, $state) {
		//------------ variable initialization
		$scope.loggedIn = false; //default

		//------------ controller functions
		//returns the login status
		$scope.isLoggedIn = function () {
			return $scope.loggedIn;
		};
		//hides all modal windows
		$scope.hideModals = function () {
			//close the login & signup modal
			$('#signModal').modal('hide');
			//close the create modal
			$('#createBoxModal').modal('hide');
		};
		//sets the login state to be true
		$scope.setLogin = function (loginStatus) {
			$scope.loggedIn = loginStatus;
			$scope.hideModals();
		};
		//gets the user profile from the server if properly authenticated already
		$scope.getProfile = function (alert) {
			$http.get('/profile')
			.success (function(data) {
				if (data !== "") {
					//if the user is logged in
					$scope.setLogin(true);
					$scope.userObject = data; //user object
					//debug note: user/email is data.local.email
					if (alert) {
						$.growl("Found profile", {
							type: "info",
							animate: {
								enter: 'animated fadeInRight',
								exit: 'animated fadeOutRight'
							}
						});
					}

				}
				else {
					$.growl("Profile data is empty", {
						type: "info",
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
				}
			})
			.error (function() {
				$.growl("Error retrieving profile", {
					type: "danger",
					animate: {
						enter: 'animated fadeInRight',
						exit: 'animated fadeOutRight'
					}
				});
			});
		}

		//gets the signed url that gives the item
		$scope.getItem = function (boxuri, itemname) {
			boxuri = "6.470/Boxes/6071e388-544d-4861-a877-e5107bed050b"; //debug
			itemname = "batman.mp4"; //debug
			reqData = {
				'uri':  boxuri,
				'key': itemname
			}
			$http.post('/getitem', reqData)
			.success (function(data) {
				console.log("Success getting item:"); //debug
				console.log(data); //debug
			})
			.error (function() {
				$.growl("Error retrieving item from the server", {
					type: "danger",
					animate: {
						enter: 'animated fadeInRight',
						exit: 'animated fadeOutRight'
					}
				});
			});
		};

		//gets the contents of the specified box uri from the server
		$scope.getBoxContents = function (boxuri) {
			boxuri = "6071e388-544d-4861-a877-e5107bed050b"; //debug
			reqData = {
				'boxname':  boxuri,
			}
			$http.post('/getbox', reqData)
				.success (function(data) {
					console.log('return data');
					console.log(data);
					return data;
				})
				.error (function() {
					$.growl("Error retrieving box contents from the server for url: " + boxuri, {
						type: "danger",
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
				});
		}

		//gets the user config file as a json for the current user
		$scope.getUserConfig = function (user) {
			user = $scope.userObject.local.email; //debug
			reqData = {
				'username':  user,
			}
			$http.post('/getuserconfig', reqData)
				.success (function(data) {

					console.log(data);
					userinfo = JSON.parse(data);
					console.log(userinfo.boxes_created);
					return userinfo;
				})
				.error (function() {
					console.log("Error getting user config file for " + user + "!");
				});
		}

		//gets a box config file given the name
		$scope.getUserConfig = function (boxid) {
			reqData = {
				'boxid':  boxid,
			}
			$http.post('/getboxconfig', reqData)
				.success (function(data) {

					console.log(data);
					boxinfo = JSON.parse(data);
					console.log(boxinfo);
					return boxinfo;
				})
				.error (function() {
					console.log("Error getting box contents for " + boxid + "!");
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
				$.growl("Successfully logged out", {
					type: "info",
					animate: {
						enter: 'animated fadeInRight',
						exit: 'animated fadeOutRight'
					}
				});

				//clears the logged-in user profile in userObject
				$scope.userObject = {};
				//clears all forms from previous user
				$('.form-create').trigger("reset");
				//set the login to be false
				$scope.setLogin(false);
			})
			.error (function() {
				$.growl("Error logging out", {
					type: "danger",
					animate: {
						enter: 'animated fadeInRight',
						exit: 'animated fadeOutRight'
					}
				});
			});
		};

		$scope.getProfile(false); //we check if we are already logged in on the server
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