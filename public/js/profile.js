(function() {
	var app = angular.module('main.profile', [
		'ui.router'
	]);

	app.controller ( 'profileController', function profileController ($scope, $http, $window,BoxList) {

		$scope.boxlist = BoxList;

		//DEBUG TODO
		//main.js has duplicate function $scope.getUserBoxes
		//gets the user config file as a json for the current user
		$scope.getUserBoxes = function (user) {
			user = $scope.userProfile.getProfile().local.email;
			reqData = {
				'username':  user,
			}
			$http.post('/getuserconfig', reqData)
				.success (function(data) {
					$scope.userinfo = JSON.parse(data);
					$scope.boxes_created =$scope.userinfo.boxes_created;
					$scope.boxes_collaborated = $scope.userinfo.boxes_collaborated;
				
					//ALL VARIABLES MUST BE CLEARED WHEN STATE IS CHANGED? 
//------------------------   retrieve box config ------------------
				for(i=0;i< $scope.boxes_created.length;i++)
					{
						$scope.getBoxConfig($scope.boxes_created[i],true);
					}
				//Don't move on unless all post requests are completed or some fail
				for(i=0;i< $scope.boxes_collaborated.length;i++)
					{
						$scope.getBoxConfig($scope.boxes_collaborated[i],false);
					}
				
				


//------------------------------------------------------------------
				})
				.error (function() {
					console.log("Error getting user config file for " + user + "!");
				});
		}
		$scope.getUserBoxes();


		
		//console.log("IN PROFILE CONTROLLER");
	});
})();
