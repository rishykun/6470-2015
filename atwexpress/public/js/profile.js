(function() {
	var app = angular.module('main.profile', [
		'ui.router'
	]);

	app.controller ( 'profileController', function profileController ($scope, $http, $window) {

		$scope.getUserBoxes = function (user) {
			console.log($scope.userProfile.getProfile().local.email);
			user = $scope.userProfile.getProfile().local.email; //debug
			reqData = {
				'username':  user,
			}
			$http.post('/getuserconfig', reqData)
				.success (function(data) {
					$scope.userinfo = JSON.parse(data);
					$scope.boxes_created =$scope.userinfo.boxes_created;
					$scope.boxes_collaborated = $scope.userinfo.boxes_collaborated;
					$scope.$parent.numboxes = $scope.userinfo.boxes_created.length + $scope.userinfo.boxes_collaborated.length;
					$scope.$parent.Created = [];
					$scope.$parent.Collaborated = [];
					//ALL VARIABLES MUST BE CLEARED WHEN STATE IS CHANGED? 
//------------------------   retrieve box config ------------------
				for(i=0;i< $scope.boxes_created.length;i++)
					{
						console.log($scope.boxes_created[i]);
						$scope.getBoxConfig($scope.boxes_created[i],true);
					}
				//Don't move on unless all post requests are completed or some fail
				for(i=0;i< $scope.boxes_collaborated.length;i++)
					{
						console.log($scope.boxes_collaborated[i]);
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
