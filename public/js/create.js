(function() {
	var app = angular.module('main.create', [
		'ui.router'
	]);

	app.controller ("createController", ["$scope", "$window", "$http", "$state", "$modalInstance", "$modal", "Auth", "UserProfile", "Box",
		function createController ($scope, $window, $http, $state, $modalInstance, Modal, Auth, UserProfile, Box) {
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
				$state.go('redirectfromloginorlogout');
			}
		};

		$scope.closeModal = function() {
			$modalInstance.dismiss('cancel');
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
						$http.post('/create', $scope.formData)
						.success (function(data) {
							jsonData = JSON.parse(data);

							$scope.box.setCurrentBoxID(jsonData.id, false);
							$scope.box.setCurrentBoxContents(jsonData);
							
							$('.form-create').trigger("reset"); //clears the signin form
							$scope.modal.closeModal();
							$.growl("Successfully created a box on the server", {
								type: "success",
								animate: {
									enter: 'animated fadeInRight',
									exit: 'animated fadeOutRight'
								}
							});
							$state.go('upload');
						})
						.error (function() {
							$.growl("Error creating a box on the server", {
							type: "danger",
							animate: {
								enter: 'animated fadeInRight',
								exit: 'animated fadeOutRight'
							}
							});
						});
					}
					else {
						$.growl("Form is empty", {
							type: "info",
							animate: {
								enter: 'animated fadeInRight',
								exit: 'animated fadeOutRight'
							}
						});
					}
				}
				else {
					$.growl("Form is empty", {
						type: "info",
						animate: {
							enter: 'animated fadeInRight',
							exit: 'animated fadeOutRight'
						}
					});
				}
			}
			else {
				$.growl("Please login or signup to use the create button", {
					type: "danger",
					animate: {
						enter: 'animated fadeInRight',
						exit: 'animated fadeOutRight'
					}
				});
			}
		};
	}]);
})();
