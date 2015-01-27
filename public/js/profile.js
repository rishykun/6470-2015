(function() {
	var app = angular.module('main.profile', [
		'ui.growl',
		'ui.router'
	]);

	app.controller ( 'profileController', function profileController ($scope, $http, $state, $window, $growl, Box, BoxList) {
		$scope.boxlist = BoxList;
		$scope.box = Box;
		$scope.catState="img/box.png";

		$scope.collapse = function () {
			console.log("entered");
			n = parseInt(Math.random()*2);
			console.log(n);
			$scope.noCat = false;
			switch(n) {
				case 0:
					$scope.catState="img/alive.png";
					break;
				case 1:
					$scope.catState="img/dead.png";
					break;
			}
		}

		$scope.uncollapse = function () {
			$scope.catState="img/box.png";
		}

		//gets the user config file as a json for the current user
		$scope.getUserBoxes = function() {
			$http.get('/getuserconfig')
				.success (function(data) {
					$scope.userinfo = data;
					$scope.boxes_created = $scope.userinfo.boxes_created;
					$scope.boxes_collaborated = $scope.userinfo.boxes_collaborated;
				
//------------------------   retrieve box config ------------------
					for(i=0;i< $scope.boxes_created.length;i++)
						{
							$scope.boxlist.getBoxConfig($scope.boxes_created[i],true);
						}
					//Don't move on unless all post requests are completed or some fail
					for(i=0;i< $scope.boxes_collaborated.length;i++)
						{
							$scope.boxlist.getBoxConfig($scope.boxes_collaborated[i],false);
						}
//------------------------------------------------------------------
				})
				.error (function() {
					$growl.box("Error", "Cannot retrieve user configuration", {
						class: "danger"
					}).open();
				});
		}
		$scope.openBoxGallery = function(id,completed){
			$scope.box.setCurrentBoxID(id, false);
			$state.go('boxview');
		};

		$scope.getUserBoxes();
	});
})();
