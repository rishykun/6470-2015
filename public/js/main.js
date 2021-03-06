(function() {
	var app = angular.module( "main", [
		'main.signin',
		'main.signup',
		'main.setupuser',
		'main.create',
		'main.receive',
		'main.upload',
		'main.profile',
		'main.settings',
		'main.help',
		'main.gallery',
		'angular-loading-bar',
		'ngAnimate',
		'ngSanitize',
		'ui.growl',
		'ui.router',
		'ui.bootstrap'
	]);

	app.controller("MainController", ["$scope", "$window", "$http", "$state", "$growl", "UserProfile", "Box", "BoxList", "Modal",
		function($scope, $window, $http, $state, $growl, UserProfile, Box, BoxList, Modal) {
		$scope.name = "Main";
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

		//TODO DEBUG
		//move this into the gallery.js file
		//if gallerycontroller is the only one that calls this function
		//gets the signed url that gives the item
		$scope.getItem = function (boxuri, itemname) {
			reqData = {
				'uri':  boxuri,
				'key': itemname
			}
			$http.post('/getitem', reqData)
			.success (function(data) {
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

		UserProfile.loadProfile(false, 'home'); //on page load, check if already logged in on the server
		//if so, then load the user data into the user profile, which is the userObject object
	}]);
})();