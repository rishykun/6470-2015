(function() {
	var app = angular.module( "main", [
		'main.state',
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
					if (Modal.checkOpenModal()) {
						Modal.closeModal(); //closes any modal that's already open
						//this can happen if the state switches directly from signup to signin or vice-versa
					}
					Modal.setModal("#signDialog", $modal);
					Modal.openModal({
						windowTemplateUrl: "custom_modal_window_template.html",
						templateUrl: "../tpl/signin/signin.tpl.html",
						backdropClass: "fullsize", //workaround for backdrop display glitch
						controller: "signinController"
					});
				},
				data: {
					requireLogin: false,
					requireLogout: true
				}
			})
			.state( 'signup', {
				url: '/signup',
				onEnter: function($modal, Modal) {
					if (Modal.checkOpenModal()) {
						Modal.closeModal(); //closes any modal that's already open
						//this can happen if the state switches directly from signup to signin or vice-versa
					}
					Modal.setModal("#signDialog", $modal);
					Modal.openModal({
						windowTemplateUrl: "custom_modal_window_template.html",
						templateUrl: "../tpl/signup/signup.tpl.html",
						backdropClass: "fullsize", //workaround for backdrop display glitch
						controller: "signupController"
					});
				},
				data: {
					requireLogin: false,
					requireLogout: true
				}
			})
			//capture state from login or logout
			.state( 'redirectfromloginorlogout', {
				url: '/',
				onEnter: function(Modal) {
					if (Modal.checkOpenModal()) {
						Modal.closeModal(); //closes any modal that's already open
					}
				},
				data: {
					requireLogin: false,
					requireLogout: false
				}
			})
			.state( 'profileview', {
				url: '/profile',
				onEnter: function(Modal) {
					if (Modal.checkOpenModal()) {
						Modal.closeModal(); //closes any modal that's already open
					}
				},
				templateUrl: "../tpl/profile/profileviewer.tpl.html",
				controller: "profileController",
				data: {
					requireLogin: true,
					requireLogout: false
				}
			})
			.state( 'boxview', {
				url: '/boxview',
				onEnter: function(Modal, $modal) {
					if (Modal.checkOpenModal()) {
						Modal.closeModal(); //closes any modal that's already open
					}
					Modal.setModal("#boxModalDialog", $modal);
					Modal.openModal({
							windowTemplateUrl: "galleryModal",
							templateUrl: "../tpl/box_view/box_view.tpl.html",
							backdropClass: "fullsize", //workaround for backdrop display glitch
							controller: "GalleryController as galleryCtrl"
						});
				},
				data: {
					requireLogin: false,
					requireLogout: false
				}
			})
			.state( 'upload', {
				url: '/upload',
				onEnter: function(Modal) {
					if (Modal.checkOpenModal()) {
						Modal.closeModal(); //closes any modal that's already open
					}
				},
				templateUrl: "../tpl/upload/upload.tpl.html",
				data: {
					requireLogin: true,
					requireLogout: false
				}
				//controller: "uploadController"
			});
	});

	app.factory('Modal', function($window, $state) {
		modalname = "";
		modal = false;
		modalopen = false;
		return {
			setModal: function(n, m) {
				if (modalopen !== false) {
					console.log("Warning: there is already an open modal.");
				}
				else if (modal !== false || modalname !== "") {
					console.log("Warning: there is already a registered modal.");
				}
				else {
					modalname = n;
					modal = m;
				}
			},
			getModalName: function () {
				return modalname;
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
					/*
					//center the open modal in the browser window
					modalopen.opened.then(function() {
						console.log("opened");
						var windowHeight = $(window).height();
						var modalHeight = $(modalname).height();
						console.log(windowHeight);
						console.log(modalHeight);
						$(modalname).css("margin-top", (windowHeight-modalHeight)/2);
						$(modalname).css("margin-left", "auto");
					});*/
				}
				else {
					console.log("Error: can't open modal because it isn't registered.");
				}
			},
			closeModal: function() {
				if (modalopen !== undefined && modalopen !== null && modalopen !== false) {
					modalclose = modalopen.close();
					//redirect state after modal closes, this allows user to open the modal again through click-based state transitions
					/*modalclose.dismiss.then(function() {
						$state.go('redirectfromloginorlogout');
					});*/
					modal = false;
					modalopen = false;
					modalname = "";
				}
				else {
					console.log("Error: can't close modal because it isn't registered.");
				}
			}
		};
	});

	/*
	app.directive('resize', function($window) {
		return {
			restrict: 'A',
			link: function(scope, element) {
				//console.log(element.css('height'));
				//console.log(element[0].offsetHeight);
			}
		};
	});*/

	app.factory('Auth', function() {
		var loggedIn = false;
		return {
			//sets the login status
			setLogin: function(loginStatus) {
				loggedIn = loginStatus;
			},
			//returns the login status
			isLoggedIn: function() {
				return loggedIn;
			}
		};
	});

	//factory that generates a service for managing the userprofile
	app.factory('UserProfile', function($state, $window, $http, Auth, Modal) {
		var userProfile = {};
		return {
			//gets the user profile from the server if properly authenticated already
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
	});

	app.factory('Box', function() {
		var currentBox = false;
		var currentBoxContents = false;
		return {
			//sets the current box
			setCurrentBox: function(b) {
				currentBox = b;

				//also load the box contents
				reqData = {
					'boxname':  currentBox.id,
				}
				$http.post('/getbox', reqData)
				.success (function(data) {
					currentBoxContents = data;
				})
				.error (function() {
					$.growl("Error retrieving box contents from the server for box id: " + currentBox.id, {
						type: "danger",
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
				});
			},
			//returns the current box
			getCurrentBox: function() {
				if (currentBox === false) {
					$.growl("There is no current box set", {
						type: "danger",
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
				}
				return currentBox;
			}
		};
	});

	app.controller("MainController", ["$scope", "$window", "$http", "$state", "$modal", "Auth", "UserProfile", "Box",
		function($scope, $window, $http, $state, $modal, Auth, UserProfile, Box) {
		
		/*var gallery = [];
		var thumbnails = [];
		boxNameObj = {
			boxname: "4daf956f-3a03-481a-ad55-818b1662daf4"
		};
		boxConfig = {boxname: boxNameObj.boxname+"/config"};
		boxThumb = {boxname: boxNameObj.boxname+"/thumbnails"};
		$http.post('/getbox', boxNameObj)
		.success (function(data) {
			$http.post('/getbox', boxConfig)
			.success (function(data) {
				for (i=1; i < data.length; i++){
					$http.post('/getitemconfig', {'uri': '6.470', 'key': data[i].Key})
					.success (function(data) {
						data = JSON.parse(data);
						gallery.push({'num': gallery.length, 'Title': data.Title, 'Author': data.Author, 'Description':data.Description,
							'Thumbs':data.Thumbs,'Comments':data.Comments});
						console.log(gallery);
					})
					.error (function() {
						console.log("Error getting config file");
					});
				}
			})
			.error (function() {
				console.log("Error getting configuration!");
			});
		})
		.error (function() {
			console.log("Error getting box!");
		});

		$http.post('/getbox', boxThumb)
		.success(function(data) {
			for (i=1; i<data.length; i++){
			$http.post('/getitem', {'uri': '6.470', 'key': data[i].Key})
			.success (function(data) {
				data = JSON.parse(data);
				thumbnails.push(data.uri);
				console.log(thumbnails);
			})
			.error (function() {
				console.log("Error getting thumbnail");
			});
		}})
		.error (function(){
			console.log("Error getting thumbnails!");
		});*/
		//------------ sets factory services to be accessible from $scope
		$scope.auth = Auth;
		$scope.userProfile = UserProfile;
		$scope.box = Box;

		//------------ controller functions
		//get the current state
		$scope.getCurrentState = function() {
			return $state.current.name.trim();
		};
		//compares the parameter state with the current state
		$scope.compareState = function (state) {
			return state === $state.current.name;
		}

		//gets the signed url that gives the item
		$scope.getItem = function (boxuri, itemname) {
			//boxuri = "6.470/Boxes/6071e388-544d-4861-a877-e5107bed050b"; //debug
			//itemname = "batman.mp4"; //debug
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
				$.growl("Error retrieving box contents from the server for box id: " + boxid, {
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
			user = $scope.userProfile.local.email; //debug
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
				$.growl("Error getting user config file for " + user, {
					type: "danger",
					animate: {
						enter: 'animated fadeInRight',
						exit: 'animated fadeOutRight'
					}
				});
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
					boxinfo = JSON.parse(data);
					console.log("------- Box Info -------");
					console.log(boxinfo);
					if(created)
					{
						console.log('adding to created');
						$scope.Created.push(boxinfo);
						document.getElementById('boxes').innerHTML = boxinfo.boxname;
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

				$scope.userProfile.clearProfile(); //clears the logged-in user profile in userObject
				$('.form-create').trigger("reset"); //clears all forms from previous user
				$scope.auth.setLogin(false); //set the login to be false
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

		UserProfile.loadProfile(true); //on page load, check if already logged in on the server
		//if so, then load the user data into the user profile, which is the userObject object

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
		$('#loginButton').click(function() {
			$scope.signModalInitResize();
		});
		$('#signupButton').click(function() {
			$scope.signModalInitResize();
		});

		//DEBUG TODO CURRENTLY BROKEN
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
	}]);

	app.run(function($rootScope, $state, $location, Auth, Modal) {
	    $rootScope.$on( '$stateChangeStart', function(e, toState, toParams, fromState) {

		    var shouldLogin = toState.data !== undefined && toState.data.requireLogin && !Auth.isLoggedIn();

		    //NOT authenticated
		    if (shouldLogin) {
		    	if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
				}
		    	$state.go('redirectfromloginorlogout');
		    	e.preventDefault();
		    	return;
		    }
		    else if (Auth.isLoggedIn() && toState.data.requireLogout) {
		    	if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
				}
		    	$state.go('redirectfromloginorlogout');
		    	e.preventDefault();
		    	return;
		    }
		});
	});
})();