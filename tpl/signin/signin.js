console.log("included!"); //debug

angular.module('main')

/*
.config(function SigninConfig($stateProvider) {
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
}) */

.controller ( 'signinController', function signinController ($scope) {
	console.log("controller works!"); //debug
})


.directive('signinViewer',function(){
    return {
	    replace : true,
	    restrict : 'A',
	    templateUrl: '../tpl/signin/signin.html'
    }; 
});