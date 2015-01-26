(function() {
	var app = angular.module('main.receive', [
		'ui.growl',
		'ui.router'
	]);

	app.controller ("receiveController", ["$scope", "$window", "$http", "$state", "$growl", "UserProfile", "Box", "CountryList",
		function receiveController ($scope, $window, $http, $state, $growl, UserProfile, Box, CountryList) {
		$scope.userProfile=UserProfile;
		$scope.box = Box;
		$scope.formData = {"filters": {"regions": [], "files": []}}; //default empty form object to be populated
		$scope.fileFilter = {"images": true, "videos": true, "audio": true, "text": true};

		$scope.receiveDrop = function() {
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

		$scope.receiveBox = function() {
			console.log($scope.formData);
			if ($scope.userProfile.isLoggedIn()) {
				if (!$scope.box.isBoxSet()) {
					//$("#receiveButton :input").prop("disabled", true); //disable button while get request is handled
					$http.post('/receivebox', $scope.formData.filters)
					.success (function(data) {
						console.log(data); //debug
						$scope.boxid = data.boxid;
						console.log($scope.boxid); //debug
						
						$scope.box.setCurrentBoxID($scope.boxid, true);
						
						//TODO DEBUG do check at this point to make sure we can upload to box before going to uploads
						//$("#receiveButton :input").prop("disabled", false); //renable button
						$growl.box("Success", "Retrieved a box from the server", {
							class: "success"
						}).open();
						$state.go('upload');
					})
					.error (function() {
						$("#receiveButton :input").prop("disabled", false); //renable button
						$growl.box("Error", "Cannot receive a box from the server. Try again later", {
							class: "danger"
						}).open();
						$state.go('home');
					});
				}
				else {
					$growl.box("Error", "Current box set already", {
						class: "danger"
					}).open();
				}
			}
			else {
				$growl.box("Warning", "Please login or signup to use the receive button", {
					class: "warning"
				}).open();
			}
		}
	}]);
})();
