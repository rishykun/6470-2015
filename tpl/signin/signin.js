angular.module('main.signin', [
])

.config(function signinConfig($stateProvider) {
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
})

.controller ( 'signinController', function signinController ($scope) {
	alert("hi");
})


.directive('signinViewer',function(){
    return {
    replace : true,
    restrict : 'E',
    templateUrl: 'signin/signin.html'
    }; 
});