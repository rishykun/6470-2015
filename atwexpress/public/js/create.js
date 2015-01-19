(function() {
	var app = angular.module('main.create', [
		'ui.router'
	]);

	app.controller ( 'createController', function createController ($scope, $http, $window) {
		$scope.formData = {}; //default empty form object to be populated

		//attempts authentication on the server with the credentials from the form
		$scope.createBox = function () {
			if ($scope.formData.hasOwnProperty("boxname")) {
				if ($scope.formData.boxname !== undefined && $scope.formData.boxname !== null
					&& $scope.formData.boxname !== "") {
					$http.post('/create', $scope.formData)
					.success (function(data) {
						$scope.setCurrentBox(JSON.parse(data));
						$('.form-create').trigger("reset"); //clears the signin form
						$scope.hideModals();
						$.growl("Successfully created a box on the server", {
							type: "success",
							animate: {
								enter: 'animated fadeInRight',
								exit: 'animated fadeOutRight'
							}
						});
						$("#uploadBoxModal").modal('show');
						//hacky
						//$("<a href='/uploading'></a>").click();
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
