(function() {
	var app = angular.module('main.upload', [
		'ui.router'
	]);

	app.controller ( 'uploadController', function uploadController ($scope, $http, $window, Box, Modal, $modal) {
		$scope.box = Box;
		$scope.formData = {}; //default empty form object to be populated

		if (Modal.checkOpenModal()) {
			Modal.closeModal(); //closes any modal that's already open
		}

		Modal.setModal("#uploadDialog", $modal);
		Modal.openModal({
			windowTemplateUrl: "uploadWindowTemplate",
			templateUrl: "../tpl/upload/upload.tpl.html",
			backdropClass: "fullsize", //workaround for backdrop display glitch
			//controller: "uploadController"
		});
	});
})();
