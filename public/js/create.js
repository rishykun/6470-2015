(function() {
	var app = angular.module('main.create', [
		'ui.router'
	]);

	app.controller ( 'createController', function createController ($scope, $http, $window, $state, UserProfile, Box, Modal) {
		$scope.userProfile=UserProfile;
		$scope.box = Box;
		$scope.modal = Modal;
		$scope.formData = {}; //default empty form object to be populated

		//attempts authentication on the server with the credentials from the form
		$scope.createBox = function () {
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
		};
	});
})();
