(function() {
	var app = angular.module( "main" );

	//handles modals
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
						$state.go('home');
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
	//factory that generates a service for managing the userprofile
	app.factory('UserProfile', function($state, $window, $growl, $http, Modal) {
		var loggedIn = false;
		var userProfile = {};
		return {
			//gets the user profile from the server if properly authenticated already
			loadProfile: function(alert) {
				$http.get('/profile')
				.success (function(data) {
					if (data !== false) {
						//if the user is logged in
						Modal.closeModal(); //close the current modal
						loggedIn = true; //set our login status to be true
						userProfile = data; //load data into the user profile
						//debug note: user/email is data.local.email
						if (alert) {
							$growl.box("Success", "Profile found", {
								class: "primary"
							}).open();
						}
						$state.go('home');
					}
					//don't notify of an empty profile
					//because this function is called immediately upon loading the website to check if the user is already logged in
					//users who just arrive on the website shouldn't be bothered immediately by a warning message
				})
				.error (function() {
					$growl.box("Error", "Cannot retrieve profile", {
						class: "danger"
					}).open();
				});
			},
			getProfile: function() {
				return userProfile;
			},
			clearProfile: function() {
				userProfile = {};
				loggedIn = false;
			},
			isLoggedIn: function() {
				return loggedIn;
			}
		}
	});
	//factory that holds the current box in view
	app.factory('Box', function($growl) {
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
						$growl.box("Error", "Cannot retrieve box contents from the server for the following box ID: " + currentBoxID, {
							class: "danger"
						}).open();
					});
				}
			},
			setCurrentBoxContents:function(b){
				currentBoxContents = b;
			},
			//returns the current box
			getCurrentBoxID: function() {
				if (currentBoxID === false) {
					$growl.box("Error", "No current box ID set", {
						class: "danger"
					}).open();
					return '';
				}
				return currentBoxID;
			},
			getCurrentBoxContents: function() {
				if (currentBoxContents === false) {
					$growl.box("Error", "No current box (contents) set", {
						class: "danger"
					}).open();
				}

				return currentBoxContents;
			},
			clearCurrentBox: function() {
				currentBoxID = false;
				currentBoxContents = false;
			}

		};
	});
	//factory that holds a list of boxes for profile view
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
})();