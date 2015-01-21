(function() {
	var app = angular.module( "main" );
	
	app.directive ('logoHeader', function() {
		return {
			templateUrl: "../tpl/header/logo.tpl.html"
		}
	});
	app.directive ('loginBar', function() {
		return {
			templateUrl: "../tpl/navbar/loginbar.tpl.html"
		}
	});
	app.directive ('navBar', function() {
		return {
			templateUrl: "../tpl/navbar/navbar.tpl.html"
		}
	});
	app.directive ('customFooter', function() {
		return {
			templateUrl: "../tpl/footer/footer.tpl.html"
		}
	});
})();