(function() {
	var app = angular.module('main.profile', [
		'ui.router'
	]);

	app.controller ( 'profileController', function profileController ($scope, $http, $window) {
		$scope.$parent.userFound = false;
		$scope.$watch("userFound",function(newval,oldval){
			console.log("got user config");
			console.log(oldval);
			console.log(newval);
			console.log($scope.userinfo);},true);
		$scope.getUserConfig();
		
	});
})();
