(function() {
	var app = angular.module( "main", [
		'main.signin',
		'main.signup',
		'main.create',
		'main.receive',
		'main.upload',
		'main.profile',
		'main.gallery',
		'main.modal',
		'angular-loading-bar',
		'ngAnimate',
		'ui.growl',
		'ui.router',
		'ui.bootstrap'
	]);
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

	app.controller("MainController", ["$scope", "$window", "$http", "$state", "$growl", "UserProfile", "Box", "BoxList", "Modal",
		function($scope, $window, $http, $state, $growl, UserProfile, Box, BoxList, Modal) {

		//------------ sets factory services to be accessible from $scope
		$scope.userProfile = UserProfile;
		$scope.box = Box;
		$scope.boxlist = BoxList;
		$scope.modal = Modal;

		//------------ controller functions
		//get the current state
		$scope.getCurrentState = function() {
			return $state.current.name.trim();
		};
		//compares the current state against the list of states provided
		$scope.compareState = function (stateList) {
			if (stateList.indexOf($state.current.name) !== -1) {
				return true;
			}
			else {
				return false;
			}
		}

		//called when the create button on the home page is clicked
		//check if user is logged in before going to the create state
		//which is where the create modal is handled by the create controller
		//if the user is not logged in, simply display a message requiring authorization
		$scope.goCreate = function() {
			if ($scope.userProfile.isLoggedIn()) {
				$state.go('create');
			}
			else {
				$growl.box("Error", "Please login or signup to use the create button", {
					class: "warning"
				}).open();
			}
		};

		//called when the receive button on the home page is clicked
		//check if user is logged in before going to the receive state
		//if the user is not logged in, simply display a message requiring authorization
		$scope.goReceive = function() {
			if ($scope.userProfile.isLoggedIn()) {
				$state.go('receive');
			}
			else {
				$growl.box("Error", "Please login or signup to use the receive button", {
					class: "warning"
				}).open();
			}
		};

		//gets the signed url that gives the item
		$scope.getItem = function (boxuri, itemname) {
			reqData = {
				'uri':  boxuri,
				'key': itemname
			}
			$http.post('/getitem', reqData)
			.success (function(data) {
				console.log("Success getting item"); //debug
				console.log(data); //debug
			})
			.error (function() {
				$growl.box("Error", "Cannot retrieve item from the server", {
					class: "danger"
				}).open();
			});
		};

		//logs the user out from the server
		$scope.logout = function () {
			$http.get('/logout')
			.success (function(data) {
				$growl.box("Success", "Logged out", {
					class: "primary"
				}).open();

				$scope.userProfile.clearProfile(); //clears the logged-in user profile in userObject
				$scope.box.clearCurrentBox();
				$scope.boxlist.clearBoxList();
				if ($scope.modal.checkModal() || $scope.modal.checkOpenModal()) {
					$scope.modal.clearModal();
				}
				$state.go('home'); //upon logout, redirect back to the home page
			})
			.error (function() {
				$growl.box("Error", "Cannot log out", {
					class: "danger"
				}).open();
			});
		};

		UserProfile.loadProfile(true); //on page load, check if already logged in on the server
		//if so, then load the user data into the user profile, which is the userObject object

		
		//captures the height from $window using jquery
		var height = $(window).height();
		var buttonHeight = $('#createBtn').height();

		//vertically aligns the Create and Receive buttons in the center
		$('#buttonGroup').css("padding-top", (height-buttonHeight)/2);



		/*
		//same for create modal
		$("#createDialog").css("margin-top", (height-createModalHeight)/2);
		$("#createDialog").css("margin-left", "auto");

		//quick hacky way to find dynamic position
		$('.modal').css("display","block");
		var createModalHeight = $('#createDialog').height();
		var loginModalHeight = $('#loginDialog').height();
		$('.modal').css("display","none");

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
		*/


		//resize function: on resize, always keep elements centered
		$(window).resize(function() {
			var newHeight = $(window).height();
			$('#buttonGroup').css("padding-top", newHeight / 2);

			/*
			$("#createDialog").css("margin-top", (newHeight-createModalHeight)/2);
			$("#createDialog").css("margin-left", "auto");

			//resize the login/signup modal
			var signModalHeight = $('#signDialog').height();
			$("#signDialog").css("margin-top", (newHeight-signModalHeight)/2);
			$("#signDialog").css("margin-left", "auto");*/
		});
	}]);
})();