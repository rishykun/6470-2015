var adjustDisplay = function(ratio) {
	if (ratio >= 1){
		$('.return').removeClass("landscape-return");
		$('.single-image-wrapper').removeClass("landscape-wrapper");
		$('.image-text').removeClass("landscape-text");
		$('.image-description').removeClass("landscape-description");
		$('.profile-wrapper').removeClass("landscape-profile-wrapper");
		$('.profile').removeClass("landscape-profile");
		$('.image-author').removeClass("landscape-author");
		$('.image-comments').removeClass("landscape-comments");
		$('.single-image-wrapper').addClass("portrait-wrapper");
		$('.image-text').addClass("portrait-text");
		$('.image-description').addClass("portrait-description");
		$('.profile-wrapper').addClass("portrait-profile-wrapper");
		$('.profile').addClass("portrait-profile");
		$('.image-author').addClass("portrait-author");
		$('.image-comments').addClass("portrait-comments");
		$('.return').addClass("portrait-return");
	}
	else{
		$('.return').removeClass("portrait-return");
		$('.single-image-wrapper').removeClass("portrait-wrapper");
		$('.image-text').removeClass("portrait-text");
		$('.image-description').removeClass("portrait-description");
		$('.profile-wrapper').removeClass("portrait-profile-wrapper");
		$('.profile').removeClass("portrait-profile");
		$('.image-author').removeClass("portrait-author");
		$('.image-comments').removeClass("portrait-comments");
		$('.single-image-wrapper').addClass("landscape-wrapper");
		$('.image-text').addClass("landscape-text");
		$('.image-description').addClass("landscape-description");
		$('.profile-wrapper').addClass("landscape-profile-wrapper");
		$('.profile').addClass("landscape-profile");
		$('.image-author').addClass("landscape-author");
		$('.image-comments').addClass("landscape-comments");
		$('.return').addClass("landscape-return");
	}
};

var getType = function(s) {
	if (s.substring(0,5) === "image") {
		return "Photo";
	}
	else if (s.substring(0,5) === "video"){
		return "Video";
	}
	else if (s.substring(s.length-3,s.length) === "pdf"){
		return "Pdf";
	}
	else{
		return "Audio";
	}

};

(function() {
	var app = angular.module( "main.gallery", ['ngSanitize', 
		'com.2fdevs.videogular', 
		"com.2fdevs.videogular.plugins.controls",
		"com.2fdevs.videogular.plugins.overlayplay",
		"com.2fdevs.videogular.plugins.poster",
		'ui.router']);

	app.controller('GalleryController', function GalleryController($sce, $scope, $window, $http, $state, Box,UserProfile){
		$scope.box = Box;
		$scope.UserProfile = UserProfile;
		$scope.UserCount = 0;
		$scope.thumbComplete = false;
	
		$scope.theme="videogular/videogular-themes/videogular.css";
		$scope.plugins= {
			controls: {
				autohide: true,
				autoHideTime: 3000
			}
		};

		$scope.pauseVid = function () {
			$('video').trigger('pause');
			$('audio').trigger('pause');
		};

		$scope.gallerydata={};
		$scope.gallery=[];

		boxNameObj = {
			boxname: $scope.box.getCurrentBoxID()
		};

		boxConfig = {boxname: boxNameObj.boxname+"/config"};
		boxThumb = {boxname: boxNameObj.boxname+"/Thumbnails"};
		boxItems = {boxname: boxNameObj.boxname+"/items"};
		
		$http.post('/getboxconfig', {boxid: boxNameObj.boxname})
		.success (function(data){
			$scope.boxComplete = data.completed;
			$scope.boxCollabs = data.collaborators;
			$scope.boxOwner = data.owner;
			$scope.boxName = data.boxname;
			$scope.boxLength = data.itemcount;

			$http.post('/getbox', boxItems)
			.success (function(data) {
				dlength = data.length;
				for (i=0; i < data.length; i++){
					$http.post('/getitemconfig', {'key': data[i].Key.substring(data[i].Key.lastIndexOf('/')+1,data[i].Key.length)})
					.success (function(data) {
						if (data.authoremail === $scope.UserProfile.getProfile().local.email) {
							$scope.UserCount++;
						};
						key = data.key;
						$scope.gallerydata[key] = false;

						if (($scope.boxComplete === "true") || ($scope.boxComplete === "false" && ((data.authoremail === $scope.UserProfile.getProfile().local.email)))) {
							$scope.gallerydata[key]={"Type": getType(data.filetype), "Title": data.title, 
							"Author": data.author, "Email": data.authoremail, "Description":data.description, "showEmail": data.showEmail};
							$http.post('/getitem', {'uri': '6.470/Boxes/' + boxThumb.boxname, 'key': key.substring(key.indexOf('/')+1,key.length)+'-t.tbl'})
							.success(function(data){
								data = JSON.parse(data);
								key = data.key.substring(0, data.key.lastIndexOf('-t.tbl'));
								$scope.gallerydata[key].Thumbnail = data.uri;
								if (Object.keys($scope.gallerydata).length === (dlength)) {
									var c = 0;
									$scope.thumbComplete = true;
									for (var key in $scope.gallerydata) {
										if ($scope.gallerydata.hasOwnProperty(key) && $scope.gallerydata[key]!== false) {
											$scope.gallery[c] = ($.extend({'key': key, 'num': c}, $scope.gallerydata[key]));
											c++;
										}
									}
									
								}
							})
							.error (function(){
								console.log("Error getting thumbnail");
							});
						}
					})
					.error (function() {
						console.log("Error getting config file");
					});
				}
			})
			.error (function() {
				console.log("Error getting configuration!");
			});
		})
		.error(function() {
			console.log("Error getting box config");
		});

		$scope.goToUpload = function() {
			$state.go('upload');
		};

		$scope.genUrl = function(num){
			$http.post('/getitem', {'uri': '6.470/Boxes/'+boxItems.boxname, 'key': $scope.gallery[num].key})
			.success (function(data) {
				data = JSON.parse(data);
				$scope.curLink = data.uri;
				$('.pdf-file').attr("data", $scope.curLink);
				$scope.audio_sources = [{src: $sce.trustAsResourceUrl($scope.curLink), type: "audio/mp3"}];
				$scope.video_sources = [{src: $sce.trustAsResourceUrl($scope.curLink), type: "video/mp4"}];
			})
			.error (function() {
				console.log("Error getting pic");
			});
		};

		$scope.num = -1;
		$scope.curLink = "";
		$scope.isImg = false;
		$scope.isVid = false;
		$scope.isAud = false;
		$scope.isPdf = false;

		$scope.setType = function(type) {
			if (type === "Photo"){
				$scope.isImg = true;
				$scope.isVid = false;
				$scope.isAud = false;
				$scope.isPdf = false;
			}
			else if (type === "Video"){
				$scope.isImg = false;
				$scope.isVid = true;
				$scope.isAud = false;
				$scope.isPdf = false;

			}
			else if (type === "Audio"){
				$scope.isImg = false;
				$scope.isVid = false;
				$scope.isAud = true;
				$scope.isPdf = false;
			}
		 	else if (type === "Pdf"){
				$scope.isImg = false;
				$scope.isVid = false;
				$scope.isAud = false;
				$scope.isPdf = true;
			}
		}

		$scope.setNum = function(num){
			$scope.num = num;
			if (num === 0){
				$scope.num = $scope.gallery.length;
			}
			if (num !== -1){
			}
		};

		var windowHeight=$(window).height();
		var windowWidth=$(window).width();

		$scope.iconSize = function() {
			$('.prev-img,.return,.next-img').css("height", windowHeight*0.06+"px");
			$('.buttons').css("padding-bottom", windowHeight*0.04+"px");
		};

		$scope.vidPad = function() {
			$('.video').css('padding-bottom', windowHeight*0.01+"px");
			$('.audio').css('padding-bottom', windowHeight*0.01+"px");
		}

		$scope.vidCss = function(type) {
			if (type === 'Video' || type === 'Audio') {
				adjustDisplay(0.9);
			}
		}

		$scope.genPdf = function(type) {
			if (type === "Pdf") {
				adjustDisplay(1.1);
			}
		}

		$scope.resetState = function (s) {
			//hacky way to prevent redirect unless we clicked outside the modal content window or the x button
			if (s.target.className === "modal fade ng-isolate-scope"
				|| s.target.className === "modal fade ng-isolate-scope in"
				|| s.currentTarget.className === "close") {
				$scope.box.clearCurrentBox(); //reset current box
				$state.go('profileview');
			}
		};

	}).directive('imageonload', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				element.bind('load', function() {
					var realWidth = $('#singleImage').get(0).width;
					var realHeight = $('#singleImage').get(0).height;
					var ratio = realHeight/realWidth;
					adjustDisplay(ratio);
				});
			}
		};
	});
})();