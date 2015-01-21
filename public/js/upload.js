(function() {
	var app = angular.module('main.upload', [
		'ui.router'
	]);

	app.controller ( 'uploadController', function uploadController ($scope, $http, $window, Box, Modal, $modal) {
		$scope.box = Box;

		//adds box name, assumes there is a current box in view
		$scope.addBoxInfoToForm = function () {
			$('#uploadform').append('<input type="hidden" id="boxname" name="boxname" value="'+ $scope.box.getCurrentBoxID() +'"/>');
		}

		if (Modal.checkOpenModal()) {
			Modal.closeModal(); //closes any modal that's already open
		}

		Modal.setModal("#uploadDialog", $modal);
		//Modal.setModalOpenEvent($scope.addBoxInfoToForm());
		Modal.openModal({
			windowTemplateUrl: "uploadWindowTemplate",
			templateUrl: "../tpl/upload/upload.tpl.html",
			backdropClass: "fullsize", //workaround for backdrop display glitch
		});

	});
})();
