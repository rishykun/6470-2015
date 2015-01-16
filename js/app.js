(function() {
	var app = angular.module( "main", [
		]);

	var gallery = [
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
		description:"",
		thumbs:"",
		comments:[]
	}/*,{
		num: 10,
		url: "http://upload.wikimedia.org/wikipedia/commons/3/3d/LARGE_elevation.jpg",
		author: "",
		thumbnail:"",
		title:"",
		description:"",
		thumbs:"",
		comments:[]
	}*/
	];

	app.controller('GalleryController', function(){
		this.gallery = gallery;
		this.num = 0;
		this.curImg = "";
		this.setNum = function(num){
			this.num = num;
			if (this.num === 0){
				this.curImg = "";
			}
			else{
				this.curImg = this.gallery[this.num-1].url;
			}
		}
		$('#singleImage').load(function() {
			var realWidth = this.width;
			var realHeight = this.height;
			var ratio = realHeight/realWidth;
			if (ratio >= 1){
				//var modalWidth = $('.modalContent').width;
				$('#singleImageWrapper').css({'display': 'inline-block', 'margin-left': 'initial','margin-right':'initial', 'left':'0px',
					'max-width': '60%', 'width': '60%', 'max-height': 'initial', 'background': 'black'});
				$('.image-text').css({
					"display": "inline-block",
					"vertical-align": "top",
					"width": "auto",
					"height": "auto"});
				$('.image-body').css({
					'margin-top': '100px',
					'margin-left': '20px'});
			}
			else{
				$('#singleImageWrapper').css({'display': 'block', 'max-height': '800px', 'margin-left':'auto', 'margin-right':'auto',
					'width': 'initial', 'max-width': 'initial','left':'initial', 'background': 'black' });
				$('.image-text').css({
					"display": "initial",
					"vertical-align": "initial",
					"width": "initial",
					"height": "initial"});
				$('.image-body').css({
					'margin-top': 'initial',
					'margin-left': 'initial'});
			}
		});
});

app.controller("MainController", function($scope, $window) {
		//captures the height from $window using jquery
		var height = $(window).height();
		var buttonHeight = $('#createBtn').height();

		//quick hacky way to find dynamic position
		$('.modal').css("display","block");
		var createModalHeight = $('#createDialog').height();
		var loginModalHeight = $('#loginDialog').height();
		$('.modal').css("display","none");

		//vertically aligns the Create and Receive buttons in the center
		$('#buttonGroup').css("padding-top", (height-buttonHeight)/2);
		//same for create modal
		$("#createDialog").css("margin-top", (height-createModalHeight)/2);
		$("#createDialog").css("margin-left", "auto");
		//same for login modal
		$("#loginDialog").css("margin-top", (height-loginModalHeight)/2);
		$("#loginDialog").css("margin-left", "auto");

		//resize function: on resize, always keep elements centered
		$(window).resize(function() {
			var newHeight = $(window).height();
			$('#buttonGroup').css("padding-top", newHeight / 2);
			$("#createDialog").css("margin-top", (newHeight-createModalHeight)/2);
			$("#createDialog").css("margin-left", "auto");
			$("#loginDialog").css("margin-top", (newHeight-loginModalHeight)/2);
			$("#loginDialog").css("margin-left", "auto");
		});
	});
})();