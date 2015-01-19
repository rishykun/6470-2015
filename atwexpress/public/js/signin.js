(function() {
	var app = angular.module('main.signin', [
		'ui.router',
		'ui.bootstrap'
	]);

	app.controller ( 'signinController', function signinController ($rootScope, $scope, $http, $window, UserProfile) {
		console.log("signinController called"); //debug
		$scope.formData = {}; //default empty form object to be populated
		$scope.$parent.signModalTitle = "Login"; //sets the title of the signin/signup modal window

		//resize signup/login modal upon click
		$scope.signModalInitResize = function () {
			//quick hacky way to find dynamic position
			console.log("accessed"); //debug
			var cheight = $(window).height();
			var cdisplay = $('.modal').css("display");
			$('#signModal').css("display","block");
			var signModalHeight = $('#signDialog').height();
			$('#signModal').css("display",cdisplay);

			console.log(cheight); //debug
			console.log(signModalHeight); //debug

			$("#signDialog").css("margin-top", (cheight-signModalHeight)/2);
			$("#signDialog").css("margin-left", "auto");
		};

		//attempts authentication on the server with the credentials from the form
		$scope.login = function () {
			if ($scope.formData.hasOwnProperty("email") && $scope.formData.hasOwnProperty("password")) {
				if ($scope.formData.email !== undefined && $scope.formData.email !== null
					&& $scope.formData.email !==""
					&& $scope.formData.password !== undefined && $scope.formData.password !== null
					&& $scope.formData.password !== "") {
					$http.post('/login', $scope.formData)
					.success (function(data) {
						$('.form-signin').trigger("reset"); //clears the signin form
						$.growl("Login successful", {
							type: "success",
							animate: {
								enter: 'animated fadeInRight',
								exit: 'animated fadeOutRight'
							}
						});
						UserProfile.loadProfile(true); //try to load the userprofile
					})
					.error (function() {
						$.growl("Error authenticating to server", {
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

		$scope.signModalInitResize(); //guarantees the resize of the signin/signup modal window when shown
	});
})();
