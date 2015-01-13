(function() {
	var app = angular.module('main.signin', [
		'ui.router'
	]);


	app.config(function SigninConfig($stateProvider, $urlRouterProvider) {
		$stateProvider.state( 'signin', {
			url: '/',
			views: {
				'main': {
					controller: "signinController",
					templateUrl: ""
				}
			},
			data: {pageTitle: "Sign In"}
		});
	});

	app.controller ( 'signinController', function signinController ($scope, $window) {
		//captures the height from $window using jquery
		var height = $(window).height();

		//quick hacky way to find dynamic position
		$('.modal').css("display","block");
		var loginModalHeight = $('#loginDialog').height();
		//console.log("window height: " + height); //debug
		//console.log("loginmodalheight: " + loginModalHeight); //debug

		$('.modal').css("display","none");

		//same for login modal
		$("#loginDialog").css("margin-top", (height-loginModalHeight)/2);
		$("#loginDialog").css("margin-left", "auto");

		//resize function: on resize, always keep elements centered
		$(window).resize(function() {
			var newHeight = $(window).height();
			//console.log("new height: " + newHeight); //debug
			//console.log("loginModalHeight: " + loginModalHeight); //debug
			$("#loginDialog").css("margin-top", (newHeight-loginModalHeight)/2);
			$("#loginDialog").css("margin-left", "auto");
		});
	});


	app.directive('signinViewer',function(){
	    return {
		    replace : true,
		    restrict : 'E',
		    templateUrl: '../tpl/signin/signin.tpl.html'
	    }; 
	});
})();