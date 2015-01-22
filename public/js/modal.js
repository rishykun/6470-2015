(function() {
	var app = angular.module('main.modal', [
		'ui.router',
	]);

	app.controller ( 'modalController', function modalController ($scope, $http, $window, $state, Auth, UserProfile) {
		$scope.formData = {}; //default empty form object to be populated
		$scope.signModalTitle = "Login"; //sets the title of the signin/signup modal window

		//sets factory services to be accessible from $scope
		$scope.auth = Auth;
		$scope.userProfile = UserProfile;

		//redirects to the home page
		$scope.resetState = function (s) {
			//hacky way to prevent redirect unless we clicked outside the modal content window or the x button
			if (s.target.className === "modal fade font-gray ng-isolate-scope"
				|| s.target.className === "modal fade font-gray ng-isolate-scope in"
				|| s.currentTarget.className === "close") {
				$state.go('home');
			}
		};

		$scope.closeModal = function() {
			$modalInstance.dismiss('cancel');
		}

	});
})();
