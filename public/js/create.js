
(function() {
	var app = angular.module('main.create', [
		'ui.growl',
		'ui.router'
	]);

	app.controller ("createController", ["$scope", "$window", "$http", "$state", "$modalInstance", "$growl", "Modal", "UserProfile", "Box", "CountryList",
		function createController ($scope, $window, $http, $state, $modalInstance, $growl, Modal, UserProfile, Box, CountryList) {
		$scope.userProfile=UserProfile;
		$scope.box = Box;
		$scope.modal = Modal;
		$scope.formData = {"filters": {"regions": [], "files": []}}; //default empty form object to be populated
		$scope.fileFilter = {"images": true, "videos": true, "audio": true, "text": true};

		$scope.createDrop = function() {
			$(".myDropdownCheckbox").dropdownCheckbox({
				data: CountryList.getCountryList(),
				title: "Choose Region(s)"
			});
			return true;
		}

		


		$scope.setFilter = function() {
			for (i=0; i<$('.myDropdownCheckbox').dropdownCheckbox("checked").length; i++)
			$scope.formData.filters.regions.push($('.myDropdownCheckbox').dropdownCheckbox("checked")[i].label);
			console.log($scope.fileFilter);
			for (var key in $scope.fileFilter) {
				if ($scope.fileFilter[key] === true) {
					$scope.formData.filters.files.push(key);
				}
			}
		}

		$scope.setBoxSize= function(){
			$scope.selection = document.getElementById("boxSizeSelection");
			$scope.formData.boxSize = $scope.selection.options[$scope.selection.selectedIndex].value;
		}

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
			if ($scope.userProfile.isLoggedIn()) {
				$scope.formData.username = $scope.userProfile.getProfile().username || '';
				if ($scope.formData.hasOwnProperty("boxname")) {
					if ($scope.formData.boxname !== undefined && $scope.formData.boxname !== null
						&& $scope.formData.boxname !== "") {
						//needs to send username/email as well
						$("#createForm :input").prop("disabled", true); //disable form while post request is handled
						$http.post('/create', $scope.formData)
						.success (function(data) {
							$scope.box.setCurrentBoxID(data.boxid, false);
							$scope.box.setCurrentBoxContents(data);
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
