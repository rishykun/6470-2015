(function() {
	var app = angular.module( "main", [
		'main.state',
		'main.signin',
		'main.signup',
		'main.create',
		'main.upload',
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
						windowTemplateUrl: "signWindowTemplate",
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
						windowTemplateUrl: "signWindowTemplate",
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
						windowTemplateUrl: "galleryWindowTemplate",
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
				data: {
					requireLogin: true,
					requireLogout: false
				},
				onEnter: function(Modal, $modal) {
					if (Modal.checkOpenModal()) {
						Modal.closeModal(); //closes any modal that's already open
					}
					Modal.setModal("#uploadDialog", $modal);
					Modal.openModal({
						windowTemplateUrl: "uploadWindowTemplate",
						templateUrl: "../tpl/upload/upload.tpl.html",
						backdropClass: "fullsize", //workaround for backdrop display glitch
						controller: "uploadController"
					});
				}
			});
	});

	app.factory('Modal', function($window, $state) {
		modalname = "";
		modal = false;
		modalopen = false;
		modalopenevent = function () {};
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
			setModalOpenEvent: function(f) {
				if (modalopen !== false) {
					console.log("Warning: there is already an open modal.");
				}
				else {
					modalopenevent = f;
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
					modalopen.opened.then(function () {
						modalopenevent;
					});
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
					modalopen.close();
					//redirect state after modal closes, this allows user to open the modal again through click-based state transitions
					/*modalclose.dismiss.then(function() {
						$state.go('redirectfromloginorlogout');
					});*/
					modal = false;
					modalopen = false;
					modalname = "";
					modalopenevent = function() {};
				}
				else {
					console.log("Error: can't close modal because it isn't open.");
				}
			},
			clearModal: function() {
				if (modalopen !== undefined && modalopen !== null && modalopen !== false) {
					modalopen.close();
				}
				else if (modal === undefined || modal === null || modal === false) {
					console.log("Error: can't clear modal because it isn't registered.");
				}
				modal = false;
				modalopen = false;
				modalname = "";
				modalopenevent = function() {};
			}
		};
	});

	//TODO DEBUG
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
									exit: 'animated fadeOutRight',
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
		var currentBoxID = false;
		var currentBoxContents = false;
		return {
			//sets the current box
			setCurrentBoxID: function(b, getContents) {
				currentBoxID = b;

				if (getContents) {
					//also load the box contents
					reqData = {
						'boxname':  currentBoxID,
					}
					$http.post('/getbox', reqData)
					.success (function(data) {
						currentBoxContents = data;
					})
					.error (function() {
						$.growl("Error retrieving box contents from the server for box id: " + currentBoxID, {
							type: "danger",
							animate: {
								enter: 'animated fadeInRight',
								exit: 'animated fadeOutRight'
							}
						});
					});
				}
			},
			setCurrentBoxContents:function(b){
				currentBoxContents = b;
			},
			//returns the current box
			getCurrentBoxID: function() {
				if (currentBoxID === false) {
					$.growl("There is no current box id set", {
						type: "danger",
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
					return '';
				}
				return currentBoxID;
			},
			getCurrentBoxContents: function() {
				if (currentBoxContents === false) {
					$.growl("There is no current box (contents) set", {
						type: "danger",
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
				}

				return currentBoxContents;
			},
			clearCurrentBox: function() {
				currentBoxID = false;
				currentBoxContents = false;
			}

		};
	});
	app.factory('BoxList', function() {
		var created = [];
		var collaborated = [];
		return{
			addCreatedBoxJson: function(bjson){
				newCreatedBox = true;
					for(i in created)
					{
						if(created[i].boxname==bjson.boxname)
						{
							newCreatedBox = false;
						}
					}
				if(newCreatedBox){
					created.push(bjson);
				}
			},
			addCollaboratedBoxJson: function(bjson){
				newCollaboratedBox = true;
					for(i in collaborated)
					{
						//TODO: change the equality? so it doesnt just rely on names
						if(collaborated[i].boxname==bjson.boxname)
						{
							newCollaboratedBox = false;
						}
					}
					if(newCollaboratedBox){
						collaborated.push(bjson);
					}
			},
			getCreatedBoxes: function(){
				return created;
			},
			getCollaboratedBoxes: function(){
				return collaborated;
			},
			clearBoxList: function() {
				created = [];
				collaborated = [];
			}
		}
	});

	app.controller("MainController", ["$scope", "$window", "$http", "$state", "$modal", "Auth", "UserProfile", "Box","BoxList",
		function($scope, $window, $http, $state, $modal, Auth, UserProfile, Box,BoxList) {
		
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
		$scope.boxlist = BoxList;

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

		//DEBUG TODO
		//MOST LIKELY NOT USED (DOUBLE CHECK)
		//profile.js uses function $scope.getUserBoxes instead
		//gets the user config file as a json for the current user
		$scope.getUserConfig = function (user) {
			user = $scope.userProfile.getProfile().local.email;
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
				boxinfo.id=boxid;
				if(created)
				{
					$scope.boxlist.addCreatedBoxJson(boxinfo);
			
				}
				else
				{
					$scope.boxlist.addCollaboratedBoxJson(boxinfo);
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
				$scope.auth.setLogin(false); //set the login to be false
				$scope.box.clearCurrentBox();
				$scope.boxlist.clearBoxList();
				if ($scope.modal.checkModal() || $scope.modal.checkOpenModal()) {
					$scope.modal.clearModal();
				}
				$('.form-create').trigger("reset"); //clears all forms from previous user
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

	app.run(function($rootScope, $state, $location, Auth, Modal, Box) {
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
		    //prevent us from getting to the upload page without a box id set (meaning we did not set a box to upload to)
		    else if (toState.url === '/upload' && Box.getCurrentBoxID() === '') {
		    	$state.go('redirectfromloginorlogout');
		    	e.preventDefault();
		    	return;
		    }
		});
	});

	app.directive ('logoHeader', function() {
		return {
			templateUrl: "../tpl/header/logo.tpl.html"
		}
	});
	app.directive ('loginBar', function() {
		return {
			templateUrl: "../tpl/navbar/loginbar.tpl.html"
		}
	});
	app.directive ('navBar', function() {
		return {
			templateUrl: "../tpl/navbar/navbar.tpl.html"
		}
	});
	app.directive ('customFooter', function() {
		return {
			templateUrl: "../tpl/footer/footer.tpl.html"
		}
	});
})();