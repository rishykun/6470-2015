(function() {
	var app = angular.module( "main", [
		'main.signin',
		'main.signup',
		'ui.router'
	]);

	/* //test //debug
	app.config (function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("state1");
		$stateProvider
			.state ("state1", {
				url: "/state1",
				templateUrl: "../partials/state1.html"
			})
			.state('state1.list', {
		      url: "/list",
		      templateUrl: "../partials/state1.list.html",
		      controller: function($scope) {
		        $scope.items = ["A", "List", "Of", "Items"];
		      }
		    })
		    .state('state2', {
		      url: "/state2",
		      templateUrl: "../partials/state2.html"
		    })
		    .state('state2.list', {
		      url: "/list",
		      templateUrl: "../partials/state2.list.html",
		      controller: function($scope) {
		        $scope.things = ["A", "Set", "Of", "Things"];
		      }
		    });
	});*/

	app.controller("MainController", function($scope, $window, $http) {
		$scope.loggedIn = false;

		$scope.isLoggedIn = function () {
			return $scope.loggedIn;
		}

		$scope.setLogin = function (loginStatus) {
			$scope.loggedIn = loginStatus;
			//if we just logged in, close the login & signup modal
			if (loginStatus) {
				$('#loginModal').modal('hide');
				$('#signupModal').modal('hide');
			}
		}

		//logs out the user from the server
		$scope.logout = function () {
			$http.get('/logout')
			.success (function(data) {
				$scope.isLoggedIn(); //debug
				console.log($scope.userObject); //debug
				console.log("successfully logged out"); //debug
				//clears the userObject
				$scope.userObject = {};
				$scope.loggedIn = false;
				console.log($scope.userObject); //debug
				$scope.isLoggedIn(); //debug
			})
			.error (function() {
			});
		};

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

		//resize function: on resize, always keep elements centered
		$(window).resize(function() {
			var newHeight = $(window).height();
			$('#buttonGroup').css("padding-top", newHeight / 2);
			$("#createDialog").css("margin-top", (newHeight-createModalHeight)/2);
			$("#createDialog").css("margin-left", "auto");
		});
	});
})();