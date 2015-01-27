(function() {
	var app = angular.module( "main" );	

	app.config (function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/");
		$stateProvider
		.state( 'signin', {
			url: '/signin',
			onEnter: function($modal, Modal) {
				if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
					//this can happen if the state switches directly from signup to signin or vice-versa
				}
				Modal.setModal("#signDialog", $modal);
				Modal.openModal({
					windowTemplateUrl: "signWindowTemplate",
					templateUrl: "../tpl/signin/signin.tpl.html",
					backdropClass: "fullsize", //workaround for backdrop display glitch
					controller: "signinController"
				});
			},
			data: {
				requireLogin: false,
				requireLogout: true
			}
		})
		.state( 'signup', {
			url: '/signup',
			onEnter: function($modal, Modal) {
				if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
					//this can happen if the state switches directly from signup to signin or vice-versa
				}
				Modal.setModal("#signDialog", $modal);
				Modal.openModal({
					windowTemplateUrl: "signWindowTemplate",
					templateUrl: "../tpl/signup/signup.tpl.html",
					backdropClass: "fullsize", //workaround for backdrop display glitch
					controller: "signupController"
				});
			},
			data: {
				requireLogin: false,
				requireLogout: true
			}
		})
		.state( 'setusername', {
			url: '/setusername',
			onEnter: function($modal, Modal) {
				if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
					//this can happen if the state switches directly from signup to signin or vice-versa
				}
				Modal.setModal("#signDialog", $modal);
				Modal.openModal({
					windowTemplateUrl: "signWindowTemplate",
					templateUrl: "../tpl/signup/setupuser.tpl.html",
					backdropClass: "fullsize", //workaround for backdrop display glitch
					controller: "setupuserController"
				});
			},
			data: {
				requireLogin: true,
				requireLogout: false
			}
		})
		//capture state from login or logout
		.state( 'home', {
			url: '/',
			onEnter: function(Modal) {
				if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
				}
			},
			data: {
				requireLogin: false,
				requireLogout: false
			}
		})
		.state( 'create', {
			url: '/create',
			onEnter: function($modal, Modal) {
				if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
					//this can happen if the state switches directly from signup to signin or vice-versa
				}
				Modal.setModal("#signDialog", $modal); //not a typo since we're using signWindowTemplate
				Modal.openModal({
					windowTemplateUrl: "signWindowTemplate", //not a typo, signWindowTemplate works for create modal
					templateUrl: "../tpl/create/create.tpl.html",
					backdropClass: "fullsize", //workaround for backdrop display glitch
					controller: "createController"
				});
			},
			data: {
				requireLogin: true,
				requireLogout: false
			}
		})
		.state( 'receive', {
			url: '/receive',
			onEnter: function($modal, Modal) {
				if (Modal.checkOpenModal()) {
					Modal.closeModal();
				}
				Modal.setModal("#signDialog", $modal);
				Modal.openModal({
					windowTemplateUrl: "signWindowTemplate", //not a typo, signWindowTemplate works for create modal
					templateUrl: "../tpl/receive/receive.tpl.html",
					backdropClass: "fullsize", //workaround for backdrop display glitch
					controller: "receiveController"
				});
			},
			data: {
				requireLogin: true,
				requireLogout: false
			}
		})
		.state( 'profileview', {
			url: '/profile',
			onEnter: function(Modal) {
				if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
				}
			},
			templateUrl: "../tpl/profile/profileviewer.tpl.html",
			controller: "profileController",
			data: {
				requireLogin: true,
				requireLogout: false
			}
		})
		.state( 'settings', {
			url: '/settings',
			onEnter: function(Modal) {
				if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
				}
			},
			templateUrl: "../tpl/settings/settings.tpl.html",
			controller: "settingsController",
			data: {
				requireLogin: true,
				requireLogout: false
			}
		})
		.state( 'boxview', {
			url: '/boxview',
			onEnter: function(Modal, $modal) {
				if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
				}
				Modal.setModal("#boxModalDialog", $modal);
				Modal.openModal({
					windowTemplateUrl: "galleryWindowTemplate",
					templateUrl: "../tpl/box_view/box_view.tpl.html",
					backdropClass: "fullsize", //workaround for backdrop display glitch
					controller: "GalleryController as galleryCtrl"
				});
			},
			data: {
				requireLogin: true,
				requireLogout: false
			}
		})
		.state( 'upload', {
			url: '/upload',
			onEnter: function(Modal, $modal) {
				if (Modal.checkOpenModal()) {
					Modal.closeModal(); //closes any modal that's already open
				}
				Modal.setModal("#uploadDialog", $modal);
				Modal.openModal({
					windowTemplateUrl: "uploadWindowTemplate",
					templateUrl: "../jQuery-File-Upload-master/upload.tpl.html",
					backdropClass: "fullsize", //workaround for backdrop display glitch
					controller: "uploadController"
				});
			},
			data: {
				requireLogin: true,
				requireLogout: false
			}
		});
	});

})();