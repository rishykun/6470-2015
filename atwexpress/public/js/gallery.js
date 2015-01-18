(function() {
	var app = angular.module( "main.gallery", ['ui.router']);
	/*var gallery = [
	{
		num: 1,
		url: "http://i.imgur.com/2GaqmYa.jpg",
		author: "niggermaster",
		thumbnail:"",
		title:"Hot chick",
		description:"Scarlett",
		thumbs:0,
		comments:[]
	},{
		num: 2,
		url: "http://i.imgur.com/Jx66U3Z.jpg",
		author: "",
		thumbnail:"",
		title:"hot chick 2",
		description:"",
		thumbs:"",
		comments:[]
	},{
		num: 3,
		url: "http://i.imgur.com/L00hGiP.jpg",
		author: "",
		thumbnail:"",
		title:"",
		description:"",
		thumbs:"",
		comments:[]
	},{
		num: 4,
		url: "http://i.imgur.com/S5DIkzB.jpg",
		author: "",
		thumbnail:"",
		title:"",
		description:"",
		thumbs:"",
		comments: []
	},{
		num: 5,
		url: "http://i.imgur.com/L7H58kq.jpg",
		author: "",
		thumbnail:"",
		title:"",
		description:"",
		thumbs:"",
		comments:[]
	},{
		num: 6,
		url: "http://jahilandalex.com/images/skyline.png",
		author: "",
		thumbnail:"",
		title:"",
		description:"",
		thumbs:"",
		comments:[]
	},{
		num: 7,
		url: "http://d3sdoylwcs36el.cloudfront.net/VEN-virtual-enterprise-network-business-opportunities-small-fish_id799929_size485.jpg",
		author: "",
		thumbnail:"",
		title:"",
		description:"",
		thumbs:"",
		comments:[]
	},{
		num: 8,
		url: "http://www.booktavern.com/wp-content/uploads/2012/11/shop-small.png",
		author: "",
		thumbnail:"",
		title:"",
		description:"",
		thumbs:"",
		comments:[]
	},{
		num: 9,
		url: "http://miriadna.com/desctopwalls/images/max/Ideal-landscape.jpg",
		author: "",
		thumbnail:"",
		title:"",
		description:"green",
		thumbs:"",
		comments:[]
	}
	];*/
	app.controller('GalleryController', function($scope, $window){
		$scope.gallery = [];

		$scope.genGallery = function () {
			boxNameObj = {
				boxname: "4daf956f-3a03-481a-ad55-818b1662daf4"
			};
			boxConfig = {boxname: boxNameObj.boxname+"/config"};
			boxThumb = {boxname: boxNameObj.boxname+"/thumbnails"};
			$http.post('/getbox', boxNameObj)
			.success (function(data) {
				$http.post('/getbox', boxConfig)
				.success (function(data) {
					for (i=1; i < data.length; i++){
						$http.post('/getitem', {'uri': boxConfig, 'key': data[i].Key})
						.success (function(data) {

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
				.success (function(data) {
					for (i=1; i < data.length; i++){
						$http.post('/getitem', {'uri': '6.470', 'key': data[i].Key})
						.success (function(data) {
							gallery[i-1].thumbnail = data.uri;
						})
						.error (function() {
							console.log("Error getting thumbnail");
						});
					}
				})
				.error (function() {
					console.log("Error getting thumnails!");
				});
			})
			.error (function() {
				console.log("Error getting box!");
			});
		};

		var windowHeight=$(window).height();
		var windowWidth=$(window).width();
		$('.prev-img,.return,.next-img').css("height", windowHeight*0.06+"px");
		$('.buttons').css("padding-bottom", windowHeight*0.03+"px");

		var adjustDisplay = function(ratio) {
			if (ratio >= 1){
				$('#singleImageWrapper').removeClass("landscape-wrapper");
				$('.image-text').removeClass("landscape-text");
				$('.image-description').removeClass("landscape-description");
				$('.profile-wrapper').removeClass("landscape-profile-wrapper");
				$('.profile').removeClass("landscape-profile");
				$('.image-author').removeClass("landscape-author");
				$('.image-comments').removeClass("landscape-comments");
				$('#singleImageWrapper').addClass("portrait-wrapper");
				$('.image-text').addClass("portrait-text");
				$('.image-description').addClass("portrait-description");
				$('.profile-wrapper').addClass("portrait-profile-wrapper");
				$('.profile').addClass("portrait-profile");
				$('.image-author').addClass("portrait-author");
				$('.image-comments').addClass("portrait-comments");
			}
			else{
				$('#singleImageWrapper').removeClass("portrait-wrapper");
				$('.image-text').removeClass("portrait-text");
				$('.image-description').removeClass("portrait-description");
				$('.profile-wrapper').removeClass("portrait-profile-wrapper");
				$('.profile').removeClass("portrait-profile");
				$('.image-author').removeClass("portrait-author");
				$('.image-comments').removeClass("portrait-comments");
				$('#singleImageWrapper').addClass("landscape-wrapper");
				$('.image-text').addClass("landscape-text");
				$('.image-description').addClass("landscape-description");
				$('.profile-wrapper').addClass("landscape-profile-wrapper");
				$('.profile').addClass("landscape-profile");
				$('.image-author').addClass("landscape-author");
				$('.image-comments').addClass("landscape-comments");
			}
		};
		this.gallery = gallery;
		this.num = -1;
		this.curImg = "";
		this.setNum = function(num){
			this.num = num;
			if (num === -1){
				this.curImg = '';
			}
			else{
				if (num === 0){
					this.num = this.gallery.length;
				}
				this.curImg = this.gallery[this.num-1].url;
			}
		}
		$('#singleImage').load(function() {
			var realWidth = this.width;
			var realHeight = this.height;
			var ratio = realHeight/realWidth;
			adjustDisplay(ratio);
		});
		app.directive('imageonload', function() {
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
	})
})();
