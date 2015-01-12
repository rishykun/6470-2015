(function() {
	var app = angular.module( "main", [
	]);

	app.controller("MainController", function($scope, $window) {
		//captures the height from $window using jquery
		var height = $(window).height();
		var buttonHeight = $('#createBtn').height();

		//quick hacky way to find dynamic position
		$('.modal').css("display","block");
		var createModalHeight = $('#createDialog').height();
		var loginModalHeight = $('#loginDialog').height();
		$('.modal').css("display","none");

		//vertically aligns the Create and Receive buttons in the center
		$('#buttonGroup').css("padding-top", (height-buttonHeight)/2);
		//same for create modal
		$("#createDialog").css("margin-top", (height-createModalHeight)/2);
		$("#createDialog").css("margin-left", "auto");
		//same for login modal
		$("#loginDialog").css("margin-top", (height-loginModalHeight)/2);
		$("#loginDialog").css("margin-left", "auto");

		//resize function: on resize, always keep Create and Receive buttons vertically aligned in the center
		$(window).resize(function() {
			$('#buttonGroup').css("padding-top", $(window).height() / 2);
		});
	});
})();