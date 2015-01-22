(function() {
	var app = angular.module('main.create', [
		'ui.growl',
		'ui.router'
	]);

	app.controller ("createController", ["$scope", "$window", "$http", "$state", "$modalInstance", "$growl", "Modal", "Auth", "UserProfile", "Box",
		function createController ($scope, $window, $http, $state, $modalInstance, $growl, Modal, Auth, UserProfile, Box) {
		$scope.auth = Auth;
		$scope.userProfile=UserProfile;
		$scope.box = Box;
		$scope.modal = Modal;
		$scope.formData = {}; //default empty form object to be populated

		//redirects to the home page
		$scope.resetState = function (s) {
			//hacky way to prevent redirect unless we clicked outside the modal content window or the x button
			if (s.target.className === "modal fade font-gray ng-isolate-scope"
				|| s.target.className === "modal fade font-gray ng-isolate-scope in"
				|| s.currentTarget.className === "close") {
				$('.form-create').trigger("reset"); //clears the create form
				$state.go('home');
			}
		};

		$scope.closeModal = function() {
			$modalInstance.dismiss('cancel');
			$('.form-create').trigger("reset"); //clears the create form
		}

		//attempts authentication on the server with the credentials from the form
		$scope.createBox = function () {
			if ($scope.auth.isLoggedIn()) {
				user = $scope.userProfile.getProfile().local.email;
				$scope.formData.username = user;
				if ($scope.formData.hasOwnProperty("boxname")) {
					if ($scope.formData.boxname !== undefined && $scope.formData.boxname !== null
						&& $scope.formData.boxname !== "") {
						//needs to send username/email as well
						$("#createForm :input").prop("disabled", true); //disable form while post request is handled
						$http.post('/create', $scope.formData)
						.success (function(data) {
							jsonData = JSON.parse(data);
							$scope.box.setCurrentBoxID(jsonData.id, false);
							$scope.box.setCurrentBoxContents(jsonData);
							$('.form-create').trigger("reset"); //clears the create form
							$("#createForm :input").prop("disabled", false); //renable form
							$scope.modal.closeModal();
							$growl.box("Success", "Created a box on the server", {
								class: "success"
							}).open();
							$state.go('upload');
						})
						.error (function() {
							$("#createForm :input").prop("disabled", false); //renable form
							$growl.box("Error", "Cannot create a box on the server", {
								class: "danger"
							}).open();
						});
					}
					else {
						$growl.box("Warning", "Empty form", {
							class: "warning"
						}).open();
					}
				}
				else {
					$growl.box("Warning", "Empty form", {
						class: "warning"
					}).open();
				}
			}
			else {
				$growl.box("Warning", "Please login or signup to use the create button", {
					class: "warning"
				}).open();
			}
		};
	}]);
})();
