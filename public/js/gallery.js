var adjustDisplay = function(ratio) {
	if (ratio >= 1){
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
	}
	else{
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
	}
};

(function() {
	var app = angular.module( "main.gallery", ['ngSanitize', 
		'com.2fdevs.videogular', 
		"com.2fdevs.videogular.plugins.controls",
		"com.2fdevs.videogular.plugins.overlayplay",
		"com.2fdevs.videogular.plugins.poster",
		'ui.router']);

	app.controller('GalleryController', function GalleryController($sce, $scope, $window, $http,Box){
		$scope.box = Box;
		//$scope.video_sources=[];
		//$scope.audio_sources=[];
		$scope.theme="videogular/videogular-themes/videogular.css";
		$scope.plugins= {
			/*poster: "http://www.videogular.com/assets/images/videogular.png",*/
			controls: {
				autohide: true,
				autoHideTime: 3000
			}
		};

		$scope.pauseVid = function () {
			$('video').trigger('pause');
			$('audio').trigger('pause');
		};

		$scope.gallery=[];

		$scope.thumbnails=[];

		boxNameObj = {
			boxname: $scope.box.getCurrentBoxID()
			//boxname: "137cab9e-9a52-4014-9c0f-3b48557bae39"
		};
		console.log(boxNameObj.boxname);
		boxConfig = {boxname: boxNameObj.boxname+"/Config"};
		boxThumb = {boxname: boxNameObj.boxname+"/Thumbnails"};
		boxItems = {boxname: boxNameObj.boxname+"/Items"};
		
		$http.post('/getbox', boxConfig)
		.success (function(data) {
			// console.log("This is data");
			// console.log(data);
			console.log("box data");
			console.log(data);
			for (i=1; i < data.length; i++){
				$http.post('/getitemconfig', {'uri': '6.470', 'key': data[i].Key})
				.success (function(data) {
					console.log("This is data");
					console.log(data);
					data = JSON.parse(data);
					$scope.gallery.push({"num": $scope.gallery.length, "Type": data.Type, "Title": data.Title, 
						"Author": data.Author, "Description":data.Description, "Thumbs":data.Thumbs,"Comments":data.Comments});
				})
				.error (function() {
					console.log("Error getting config file");
				});
			}
		})
		.error (function() {
			console.log("Error getting configuration!");
		});

		$http.post('/getbox', boxThumb)
		.success(function(data) {
			for (i=1; i<data.length; i++){
				$http.post('/getitem', {'uri': '6.470', 'key': data[i].Key})
				.success (function(data) {
					data = JSON.parse(data);
					$scope.thumbnails.push(data.uri);
				})
				.error (function() {
					console.log("Error getting thumbnail");
				});
			}})
		.error (function(){
			console.log("Error getting thumbnails!");
		});

		$scope.genUrl = function(num){
			if (num === 0) {
				num = $scope.gallery.length
			}
			$http.post('/getbox', boxItems)
			.success(function(data) {
				$http.post('/getitem', {'uri': '6.470', 'key': data[num].Key})
				.success (function(data) {
					data = JSON.parse(data);
					$scope.curLink = data.uri;
					console.log($scope.curLink);
					//var myPDF = PDFObject({url: $scope.curLink}).embed('pdf-view');
					//console.log($scope.curLink);
					//$scope.audio_sources = [{src: $sce.trustAsResourceUrl($scope.curLink), type: "audio/mp3"}];
					$scope.video_sources = [{src: $sce.trustAsResourceUrl($scope.curLink), type: "video/mp4"}];
					//$scope.curLink = "https://www.google.com.ua/images/srpr/logo4w.png";
				})
				.error (function() {
					console.log("Error getting pic");
				});
			})
			.error (function(){
				console.log("Error getting box_pic!");
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
				console.log($scope.gallery);
				console.log("Photo");
				$scope.isImg = true;
				$scope.isVid = false;
				$scope.isAud = false;
				$scope.isPdf = false;
			}
			else if (type === "Video"){
				console.log("Video");
				$scope.isImg = false;
				$scope.isVid = true;
				$scope.isAud = false;
				$scope.isPdf = false;
			}
		}
		// 	else if (type === "Audio"){
		// 		$scope.isImg = false;
		// 		$scope.isVid = false;
		// 		$scope.isAud = true;
		// 		$scope.isPdf = false;
		// 	}
		// 	else if (type === "Pdf"){
		// 		$scope.isImg = false;
		// 		$scope.isVid = false;
		// 		$scope.isAud = false;
		// 		$scope.isPdf = true;
		// 	}
		// }

		$scope.setNum = function(num){
			$scope.num = num;
			if (num === 0){
				$scope.num = $scope.gallery.length;
			}
			//$scope.curLink = "";
			if (num !== -1){
				//$scope.curLink = $scope.gallery[$scope.num-1].url;
			}
		};

		var windowHeight=$(window).height();
		var windowWidth=$(window).width();

		$scope.iconSize = function() {
			$('.prev-img,.return,.next-img').css("height", windowHeight*0.06+"px");
			$('.buttons').css("padding-bottom", windowHeight*0.03+"px");
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
			console.log("genPdf accessing");
			console.log($scope.curLink);
			if (type === "Pdf") {
				adjustDisplay(1.1);
			}
		}

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