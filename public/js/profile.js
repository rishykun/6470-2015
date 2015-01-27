(function() {
	var app = angular.module('main.profile', [
		'ui.growl',
		'ui.router'
	]);

	app.controller ( 'profileController', function profileController ($scope, $http, $state, $window, $growl, Box, BoxList) {
		$scope.boxlist = BoxList;
		$scope.box = Box;
		$scope.mouseIndex=false;
		$scope.section=false;

		$scope.catState=function (index, section, box) {
			if (box.itemcount === box.capacity){
				return "img/complete.png";
			}
			else if ((!$scope.mouseIndex && $scope.mouseIndex !== 0) || (!$scope.section && $scope.section !== 0)) {
				return "img/box.png";
			}
			else if ((index === $scope.mouseIndex) && (section === $scope.section)) {
				n = parseInt(Math.random()*2);
				switch(n) {
					case 0:
						return "img/alive.png";
						break;
					case 1:
						return "img/dead.png";
						break;
				}
			}
		};

		$scope.setIndex = function (index, section) {
 			$scope.mouseIndex = index;
 			$scope.section = section;
		};

		$scope.resetIndex = function () {
			$scope.mouseIndex = false;
			$scope.section = false;
		};

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
