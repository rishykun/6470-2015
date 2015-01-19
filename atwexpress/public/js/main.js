(function() {
	var app = angular.module( "main", [
		'main.signin',
		'main.signup',
		'main.create',
		'main.profile',
		'main.gallery',
		'ui.router',
		'ui.bootstrap'
	]);

	app.config (function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/");
		$stateProvider
			.state( 'signin', {
				url: '/signin',
				onEnter: function($modal, Modal) {
					console.log("on enter"); //debug
					//$scope.activateSignin();
					Modal.setModal($modal);
					Modal.openModal({
						windowTemplateUrl: "custom_modal_window_template.html",
						templateUrl: "../tpl/signin/signin.tpl.html",
						backdropClass: "fullsize",
						controller: "signinController"
						//windowClass: "custom-signModal"
					});
					/*
					$modal.open({
						windowTemplateUrl: "custom_modal_window_template.html",
						templateUrl: "../tpl/signin/signin.tpl.html",
						backdropClass: "fullsize",
						controller: "signinController"
						//windowClass: "custom-signModal"
					});*/
				},
				data: {
					requireLogin: false
				}
			})
			.state( 'signup', {
				url: '/signup',
				onEnter: function($modal) {
					console.log("on enter"); //debug
					$modal.open({
						template: [
				        '<div class="modal-content">',
				          '<div class="modal-header">',
				            '<h3 class="modal-title">Regulamin</h3>',
				          '</div>',
				          '<div class="modal-body">',
				          '$1. Give us all your money!',
				          '</div>',
				          '<div class="modal-footer">',
				            '<button class="btn btn-primary" ng-click="$dismiss()">OK</button>',
				          '</div>',
				        '</div>'
				        ].join(''),
						//templateUrl: "../tpl/signup/signup.tpl.html",
						controller: "signupController"
					});
				},
				data: {
					requireLogin: false
				}
			})
			.state( 'redirectfromloginorlogout', {
				url: '/',
				data: {
					requireLogin: false
				}
			})
			.state( 'profileview', {
				url: '/profile',
				templateUrl: "../tpl/profile/profileviewer.tpl.html",
				controller: "profileController",
				data: {
					requireLogin: true
				}
			})
			.state( 'boxview', {
				url: '/boxview',
				templateUrl: "../tpl/box_view/box_view.tpl.html",
				controller: "galleryController",
				data: {
					requireLogin: true
				}
			})
			.state( 'upload', {
				url: '/upload',
				templateUrl: "../tpl/upload/upload.tpl.html",
				data: {
					requireLogin: true
				}
				//controller: "uploadController"
			});
	});

	app.factory('Modal', function() {
		modal = false;
		modalopen = false;
		return {
			setModal: function(m) {
				if (modalopen !== false) {
					console.log("Warning: there is already an open modal.");
				}
				else if (modal !== false) {
					console.log("Warning: there is already a registered modal.");
				}
				else {
					modal = m;
				}
			},
			checkModal: function() {
				return (modal !== undefined && modal !== null && modal !== false);
			},
			checkOpenModal: function() {
				return (modalopen !== undefined && modalopen !== null && modalopen !== false);
			},
			openModal: function(obj) {
				if (modal !== undefined && modal !== null && modal !== false) {
					modalopen = modal.open(obj);
				}
				else {
					console.log("Error: can't open modal because it isn't registered.");
				}
			},
			closeModal: function() {
				if (modalopen !== undefined && modalopen !== null && modalopen !== false) {
					modalopen.close();
					modal = false;
					modalopen = false;
				}
				else {
					console.log("Error: can't close modal because it isn't registered.");
				}
			}
		};
	});

	app.factory('Auth', function() {
		var loggedIn = false;
		return {
			setLogin: function(loginStatus) {
				loggedIn = loginStatus;
			},
			isLoggedIn: function() {
				return loggedIn;
			}
		};
	});

	//factory that generates a service for managing the userprofile
	app.factory('UserProfile', function($state, $window, $http, Auth, Modal) {
		var userProfile = {};
		return {
			loadProfile: function(alert) {
				$http.get('/profile')
				.success (function(data) {
					if (data !== "") {
						//if the user is logged in
						Modal.closeModal(); //close the current modal
						Auth.setLogin(true); //set our login status to be true
						userProfile = data; //load data into the user profile
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
						$state.go('redirectfromloginorlogout');
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
			},
			getProfile: function() {
				return userProfile;
			},
			clearProfile: function() {
				userProfile = {};
			}
		}
	})

	app.controller("MainController", ["$scope", "$window", "$http", "$state", "Auth", "$modal", "UserProfile",
		function($scope, $window, $http, $state, Auth, $modal, UserProfile) {

		/*
		$scope.activateSignin = function() {
			$modal.open({
				scope: $scope,
				windowTemplateUrl: "customwindow.html",
				templateUrl: "../tpl/signin/signin.tpl.html",
				backdropClass: "fullsize",
				controller: "signinController"
				//windowClass: "custom-signModal"
			});
		};*/

		//------------ variable initialization
		$scope.auth = Auth;
		$scope.userProfile = UserProfile;

		$scope.testvalue = "teststring"; //debug

		console.log("testvalue is " + $scope.testvalue); //debug

		//------------ controller functions
		//get the current state
		$scope.getCurrentState = function() {
			return $state.current.name.trim();
		};
		//compares the parameter state with the current state
		$scope.compareState = function (state) {
			return state === $state.current.name;
		}
		//returns the login status
		$scope.isLoggedIn = function () {
			return $scope.auth.isLoggedIn();
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
			$scope.auth.setLogin(loginStatus);
			$scope.hideModals();
			$state.go('redirectfromloginorlogout'); //go this state, which redirects to the home page whenever we sign in or sign out
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
		$scope.getBoxContents = function (boxid) {
			reqData = {
				'boxname':  boxid,
			}
			$http.post('/getbox', reqData)
				.success (function(data) {
					console.log('return data'); //debug
					console.log(data); //debug
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
					$scope.userinfo = JSON.parse(data);
					$scope.userFound = true;
					//console.log(userinfo);
				})
				.error (function() {
					console.log("Error getting user config file for " + user + "!");
				});
		}

		//gets a box config file given the name
		$scope.getBoxConfig = function (boxid,created) {
			reqData = {
				'boxid':  boxid,
			}
			$http.post('/getboxconfig', reqData)
				.success (function(data) {

					boxinfo = JSON.parse(data);
					console.log("------- Box Info -------");
					console.log(boxinfo);
					if(created)
					{
						console.log('adding to created');
						$scope.Created.push(boxinfo);
						console.log($scope.Created.length);
					}
					else
					{
						console.log('adding to collaborated');
						$scope.Collaborated.push(boxinfo);
					}
					if(($scope.Created.length+$scope.Collaborated.length)==$scope.numboxes){
						console.log('IN THE CREATED COLLABORATED');
						console.log($scope.Created);
						console.log($scope.Collaborated);
					}
					
				})
				.error (function() {
					console.log("Error getting box contents for " + boxid + "!");
				});
		}
		


		//sets the current box
		$scope.setCurrentBox = function (box) {
			$scope.currentBox = box;
			//gets the content of that box for the box-viewer
			$scope.currentBoxContents = $scope.getBoxContents(box.id);
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
				$scope.userProfile.clearProfile();
				//clears all forms from previous user
				$('.form-create').trigger("reset");
				//set the login to be false
				$scope.auth.setLogin(false);
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

		/*
		$('#loginButton').click(function() {
			$scope.signModalInitResize();
		});
		$('#signupButton').click(function() {
			$scope.signModalInitResize();
		});*/

		//resize function: on resize, always keep elements centered
		$(window).resize(function() {
			var newHeight = $(window).height();
			$('#buttonGroup').css("padding-top", newHeight / 2);
			$("#createDialog").css("margin-top", (newHeight-createModalHeight)/2);
			$("#createDialog").css("margin-left", "auto");

			console.log("resize called"); //debug

			//resize the login/signup modal
			var signModalHeight = $('#signDialog').height();
			console.log(newHeight);
			console.log(signModalHeight);
			$("#signDialog").css("margin-top", (newHeight-signModalHeight)/2);
			$("#signDialog").css("margin-left", "auto");
		});
	}]);

	app.run(function($rootScope, $state, $location, Auth) {
	    $rootScope.$on( '$stateChangeStart', function(e, toState, toParams, fromState) {

	    	console.log("toState url: " + toState.url); //debug
	    	console.log("fromState url: " + fromState.url); //debug

		    var shouldLogin = toState.data !== undefined && toState.data.requireLogin && !Auth.isLoggedIn();
		    console.log("!Auth.loggedin: " + !Auth.isLoggedIn()); //debug
		    console.log(" should we login: " + shouldLogin); //debug
		    //NOT authenticated
		    if (shouldLogin) {
		    	console.log("we should"); //debug
		    	$state.go('signin');
		    	e.preventDefault();
		    	return;
		    }
		    console.log("we don't need to "); //debug
		});
	});
})();