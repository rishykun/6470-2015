(function() {
	var app = angular.module( "main" );
	
	//checks to prevent illegal states
	app.run(function($rootScope, $state, $location, UserProfile, Modal, Box) {
	    $rootScope.$on( '$stateChangeStart', function(e, toState, toParams, fromState) {

		    var shouldLogin = toState.data !== undefined && toState.data.requireLogin && !UserProfile.isLoggedIn();

		    //not authenticated, should not access states that require authentication
		    if (shouldLogin) {
		    	if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
				}
		    	$state.go('home');
		    	e.preventDefault();
		    	return;
		    }
		    //cannot access states that require user to not be authenticated
		    else if (UserProfile.isLoggedIn() && toState.data.requireLogout) {
		    	if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
				}
		    	$state.go('home');
		    	e.preventDefault();
		    	return;
		    }
		    //prevent user from getting to the upload page without a box id set (meaning user did not set a box to upload to)
		    // else if (toState.url === '/upload' && Box.getCurrentBoxID() === '') {
		    // 	$state.go('home');
		    // 	e.preventDefault();
		    // 	return;
		    //}
		});
	});
})();