(function() {
	var app = angular.module('main.state', [
		'ui.router'
	]);

	app.controller ( 'stateController', function stateController ($scope, $http, $state) {

		//redirects to the home page
		$scope.resetState = function () {
			$state.go('redirectfromloginorlogout');
		};
	});
})();
