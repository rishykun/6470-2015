(function() {
	var app = angular.module( "main", [
	]);


	app.controller("MainController", function($scope, $window) {
		
		//captures the height from $window using jquery
		var height = $(window).height();
		var buttonHeight = $('#createBtn').height();

		//quick hacky way to find dynamic position
		$('.modal').css("display","block");
		var createModalHeight = $('#modalDialog').height();
		$('.modal').css("display","none");

		//vertically aligns the Create and Receive buttons in the center
		$('#buttonGroup').css("padding-top", (height-buttonHeight)/2);
		//same for create modal
		$(".modal-dialog").css("margin-top", (height-createModalHeight)/2);
		$(".modal-dialog").css("margin-left", "auto");

		//resize function: on resize, always keep Create and Receive buttons vertically aligned in the center
		$(window).resize(function() {
			$('#buttonGroup').css("padding-top", $(window).height() / 2);
		});
	});

	//move this to signin.js
	app.directive('signinViewer',function(){
	    return {
		    replace : true,
		    restrict : 'A',
		    templateUrl: 'tpl/signin/signin.html'
	    }; 
	});
})();