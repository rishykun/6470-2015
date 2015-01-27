(function() {
	var app = angular.module( "main" );

	//handles modals
	app.factory('Modal', function($window, $state) {
		modalname = "";
		modal = false;
		modalopen = false;
		modalopenevent = function () {};
		return {
			setModal: function(n, m) {
				if (modalopen !== false) {
					console.log("Warning: there is already an open modal.");
				}
				else if (modal !== false || modalname !== "") {
					console.log("Warning: there is already a registered modal.");
				}
				else {
					modalname = n;
					modal = m;
				}
			},
			setModalOpenEvent: function(f) {
				if (modalopen !== false) {
					console.log("Warning: there is already an open modal.");
				}
				else {
					modalopenevent = f;
				}
			},
			getModalName: function () {
				return modalname;
			},
			checkModal: function() {
				return (modal !== undefined && modal !== null && modal !== false);
			},
			checkOpenModal: function() {
				return (modalopen !== undefined && modalopen !== null && modalopen !== false);
			},
			openModal: function(obj) {
				if (modal !== undefined && modal !== null && modal !== false) {
					modalopen = modal.open(obj);
					modalopen.opened.then(function () {
						modalopenevent;
					});
					/*
					//center the open modal in the browser window
					modalopen.opened.then(function() {
						console.log("opened");
						var windowHeight = $(window).height();
						var modalHeight = $(modalname).height();
						console.log(windowHeight);
						console.log(modalHeight);
						$(modalname).css("margin-top", (windowHeight-modalHeight)/2);
						$(modalname).css("margin-left", "auto");
					});*/
				}
				else {
					console.log("Error: can't open modal because it isn't registered.");
				}
			},
			closeModal: function() {
				if (modalopen !== undefined && modalopen !== null && modalopen !== false) {
					modalopen.close();
					//redirect state after modal closes, this allows user to open the modal again through click-based state transitions
					/*modalclose.dismiss.then(function() {
						$state.go('home');
					});*/
					modal = false;
					modalopen = false;
					modalname = "";
					modalopenevent = function() {};
				}
				else {
					console.log("Error: can't close modal because it isn't open.");
				}
			},
			clearModal: function() {
				if (modalopen !== undefined && modalopen !== null && modalopen !== false) {
					modalopen.close();
				}
				else if (modal === undefined || modal === null || modal === false) {
					console.log("Error: can't clear modal because it isn't registered.");
				}
				modal = false;
				modalopen = false;
				modalname = "";
				modalopenevent = function() {};
			}
		};
	});
	//factory that generates a service for managing the userprofile
	app.factory('UserProfile', function($state, $window, $growl, $http, Modal) {
		var loggedIn = false;
		var userProfile = {};
		return {
			//gets the user profile from the server if properly authenticated already
			loadProfile: function(alert, toState) {
				$http.get('/profile')
				.success (function(data) {
					if (data !== false) {
						//if the user is logged in
						if (Modal.checkOpenModal()) {
							Modal.closeModal(); //close the current modal
						}
						loggedIn = true; //set our login status to be true
						userProfile = data; //load data into the user profile
						//debug note: user/email is data.local.email
						if (alert) {
							$growl.box("Success", "Profile found", {
								class: "primary"
							}).open();
						}
						if (toState !== '') {
							$state.go(toState); //redirects to a state after success loading user profile
						}
					}
					//don't notify of an empty profile
					//because this function is called immediately upon loading the website to check if the user is already logged in
					//users who just arrive on the website shouldn't be bothered immediately by a warning message
				})
				.error (function() {
					$growl.box("Error", "Cannot retrieve profile", {
						class: "danger"
					}).open();
				});
			},
			getProfile: function() {
				return userProfile;
			},
			clearProfile: function() {
				userProfile = {};
				loggedIn = false;
			},
			isLoggedIn: function() {
				return loggedIn;
			}
		}
	});
	//factory that holds the current box in view
	app.factory('Box', function($growl, $http) {
		var currentBoxID = false;
		var currentBoxContents = false;
		return {
			isBoxSet: function() {
				if (currentBoxID !== false && currentBoxContents !== false) {
					return true;
				}
				else {
					return false;
				}
			},
			setCurrentBoxID: function(b, getContents) {
				currentBoxID = b;

				if (getContents) {
					//also load the box contents
					reqData = {
						'boxname':  currentBoxID,
					}
					$http.post('/getbox', reqData)
					.success (function(data) {
						currentBoxContents = data;
					})
					.error (function() {
						$growl.box("Error", "Cannot retrieve box contents from the server for the following box ID: " + currentBoxID, {
							class: "danger"
						}).open();
					});
				}

			},
			setCurrentBoxContents:function(b){
				currentBoxContents = b;
			},
			getCurrentBoxID: function() {
				if (currentBoxID === false) {
					$growl.box("Error", "No current box ID set", {
						class: "danger"
					}).open();
					return '';
				}
				return currentBoxID;
			},
			getCurrentBoxContents: function() {
				if (currentBoxContents === false) {
					$growl.box("Error", "No current box (contents) set", {
						class: "danger"
					}).open();
				}

				return currentBoxContents;
			},
			clearCurrentBox: function() {
				currentBoxID = false;
				currentBoxContents = false;
			}

		};
	});
	//factory that holds a list of boxes for profile view
	app.factory('BoxList', function($http, $growl) {
		var created = [];
		var collaborated = [];
		return{
			//gets a box config file given the name
			//and will either add it to created or collaborated depending on isCreated
			getBoxConfig: function (boxid, isCreated) {
				created = []; //reset boxes everytime we try to grab box info
				collaborated = [];
				reqData = {
					'boxid':  boxid,
				}
				$http.post('/getboxconfig', reqData)
				.success (function(data) {
					boxinfo = data;
					if(isCreated) {
						//check if the box is already added to prevent duplicates
						newCreatedBox = true;
						for(i in created)
						{
							if(created[i].boxid === boxinfo.boxid)
							{
								newCreatedBox = false;
							}
						}
						if (newCreatedBox) {
							created.push(boxinfo);
						}
				
					}
					else {
						//check if the box is already added to prevent duplicates
						newCollaboratedBox = true;
						for(i in collaborated)
						{
							if(collaborated[i].boxname === boxinfo.boxname)
							{
								newCollaboratedBox = false;
							}
						}
						if (newCollaboratedBox) {
							collaborated.push(boxinfo);
						}
					}	
				})
				.error (function() {
					$growl.box("Error", "Cannot retrieve box contents from the server for the following box ID: " + boxid, {
						class: "danger"
					}).open();
				});
			},
			addCreatedBoxJson: function(bjson){
				newCreatedBox = true;
				for(i in created)
				{
					if(created[i].boxname===bjson.boxname)
					{
						newCreatedBox = false;
					}
				}
				if(newCreatedBox){
					created.push(bjson);
				}
			},
			addCollaboratedBoxJson: function(bjson){
				newCollaboratedBox = true;
				for(i in collaborated)
				{
					//TODO: change the equality? so it doesnt just rely on names
					if(collaborated[i].boxname===bjson.boxname)
					{
						newCollaboratedBox = false;
					}
				}
				if(newCollaboratedBox){
					collaborated.push(bjson);
				}
			},
			getCreatedBoxes: function(){
				return created;
			},
			getCollaboratedBoxes: function(){
				return collaborated;
			},
			clearBoxList: function() {
				created = [];
				collaborated = [];
			}
		}
	});

	app.factory('CountryList', function() {
		var countryData =
		[{id: 1, label: "Africa" },
		{id: 2, label: "Antarctica" },
		{id: 3, label: "Asia" },
		{id: 4, label: "Europe" },
		{id: 5, label: "North America" },
		{id: 6, label: "Oceania" },
		{id: 7, label: "South America" },
		{id: 8, label: "Afghanistan" },
		{id: 9, label: "Albania" },
		{id: 10, label: "Algeria" },
		{id: 11, label: "American Samoa" },
		{id: 12, label: "Andorra" },
		{id: 13, label: "Angola" },
		{id: 14, label: "Anguilla" },
		{id: 15, label: "Antigua & Barbuda" },
		{id: 16, label: "Argentina" },
		{id: 17, label: "Armenia" },
		{id: 18, label: "Aruba" },
		{id: 19, label: "Australia" },
		{id: 20, label: "Austria" },
		{id: 21, label: "Azerbaijan" },
		{id: 22, label: "Bahamas" },
		{id: 23, label: "Bahrain" },
		{id: 24, label: "Bangladesh" },
		{id: 25, label: "Barbados" },
		{id: 26, label: "Belarus" },
		{id: 27, label: "Belgium" },
		{id: 28, label: "Belize" },
		{id: 29, label: "Benin" },
		{id: 30, label: "Bermuda" },
		{id: 31, label: "Bhutan" },
		{id: 32, label: "Bolivia" },
		{id: 33, label: "Bonaire" },
		{id: 34, label: "Bosnia & Herzegovina" },
		{id: 35, label: "Botswana" },
		{id: 36, label: "Brazil" },
		{id: 37, label: "British Indian Ocean Ter" },
		{id: 38, label: "Brunei" },
		{id: 39, label: "Bulgaria" },
		{id: 40, label: "Burkina Faso" },
		{id: 41, label: "Burundi" },
		{id: 42, label: "Cambodia" },
		{id: 43, label: "Cameroon" },
		{id: 44, label: "Canada" },
		{id: 45, label: "Canary Islands" },
		{id: 46, label: "Cape Verde" },
		{id: 47, label: "Cayman Islands" },
		{id: 48, label: "Central African Republic" },
		{id: 49, label: "Chad" },
		{id: 50, label: "Channel Islands" },
		{id: 51, label: "Chile" },
		{id: 52, label: "China" },
		{id: 53, label: "Christmas Island" },
		{id: 54, label: "Cocos Island" },
		{id: 55, label: "Colombia" },
		{id: 56, label: "Comoros" },
		{id: 57, label: "Congo" },
		{id: 58, label: "Cook Islands" },
		{id: 59, label: "Costa Rica" },
		{id: 60, label: "Cote D'Ivoire" },
		{id: 61, label: "Croatia" },
		{id: 62, label: "Cuba" },
		{id: 63, label: "Curacao" },
		{id: 64, label: "Cyprus" },
		{id: 65, label: "Czech Republic" },
		{id: 66, label: "Denmark" },
		{id: 67, label: "Djibouti" },
		{id: 68, label: "Dominica" },
		{id: 69, label: "Dominican Republic" },
		{id: 70, label: "East Timor" },
		{id: 71, label: "Ecuador" },
		{id: 72, label: "Egypt" },
		{id: 73, label: "El Salvador" },
		{id: 74, label: "Equatorial Guinea" },
		{id: 75, label: "Eritrea" },
		{id: 76, label: "Estonia" },
		{id: 77, label: "Ethiopia" },
		{id: 78, label: "Falkland Islands" },
		{id: 79, label: "Faroe Islands" },
		{id: 80, label: "Fiji" },
		{id: 81, label: "Finland" },
		{id: 82, label: "France" },
		{id: 83, label: "French Guiana" },
		{id: 84, label: "French Polynesia" },
		{id: 85, label: "French Southern Ter" },
		{id: 86, label: "Gabon" },
		{id: 87, label: "Gambia" },
		{id: 88, label: "Georgia" },
		{id: 89, label: "Germany" },
		{id: 90, label: "Ghana" },
		{id: 91, label: "Gibraltar" },
		{id: 92, label: "Great Britain" },
		{id: 93, label: "Greece" },
		{id: 94, label: "Greenland" },
		{id: 95, label: "Grenada" },
		{id: 96, label: "Guadeloupe" },
		{id: 97, label: "Guam" },
		{id: 98, label: "Guatemala" },
		{id: 99, label: "Guinea" },
		{id: 100, label: "Guyana" },
		{id: 101, label: "Haiti" },
		{id: 102, label: "Hawaii" },
		{id: 103, label: "Honduras" },
		{id: 104, label: "Hong Kong" },
		{id: 105, label: "Hungary" },
		{id: 106, label: "Iceland" },
		{id: 107, label: "India" },
		{id: 108, label: "Indonesia" },
		{id: 109, label: "Iran" },
		{id: 110, label: "Iraq" },
		{id: 111, label: "Ireland" },
		{id: 112, label: "Isle of Man" },
		{id: 113, label: "Israel" },
		{id: 114, label: "Italy" },
		{id: 115, label: "Jamaica" },
		{id: 116, label: "Japan" },
		{id: 117, label: "Jordan" },
		{id: 118, label: "Kazakhstan" },
		{id: 119, label: "Kenya" },
		{id: 120, label: "Kiribati" },
		{id: 121, label: "Korea North" },
		{id: 122, label: "Korea South" },
		{id: 123, label: "Kuwait" },
		{id: 124, label: "Kyrgyzstan" },
		{id: 125, label: "Laos" },
		{id: 126, label: "Latvia" },
		{id: 127, label: "Lebanon" },
		{id: 128, label: "Lesotho" },
		{id: 129, label: "Liberia" },
		{id: 130, label: "Libya" },
		{id: 131, label: "Liechtenstein" },
		{id: 132, label: "Lithuania" },
		{id: 133, label: "Luxembourg" },
		{id: 134, label: "Macau" },
		{id: 135, label: "Macedonia" },
		{id: 136, label: "Madagascar" },
		{id: 137, label: "Malaysia" },
		{id: 138, label: "Malawi" },
		{id: 139, label: "Maldives" },
		{id: 140, label: "Mali" },
		{id: 141, label: "Malta" },
		{id: 142, label: "Marshall Islands" },
		{id: 143, label: "Martinique" },
		{id: 144, label: "Mauritania" },
		{id: 145, label: "Mauritius" },
		{id: 146, label: "Mayotte" },
		{id: 147, label: "Mexico" },
		{id: 148, label: "Midway Islands" },
		{id: 149, label: "Moldova" },
		{id: 150, label: "Monaco" },
		{id: 151, label: "Mongolia" },
		{id: 152, label: "Montserrat" },
		{id: 153, label: "Morocco" },
		{id: 154, label: "Mozambique" },
		{id: 155, label: "Myanmar" },
		{id: 156, label: "Nambia" },
		{id: 157, label: "Nauru" },
		{id: 158, label: "Nepal" },
		{id: 159, label: "Netherland Antilles" },
		{id: 160, label: "Netherlands (Holland, Europe)" },
		{id: 161, label: "Nevis" },
		{id: 162, label: "New Caledonia" },
		{id: 163, label: "New Zealand" },
		{id: 164, label: "Nicaragua" },
		{id: 165, label: "Niger" },
		{id: 166, label: "Nigeria" },
		{id: 167, label: "Niue" },
		{id: 168, label: "Norfolk Island" },
		{id: 169, label: "Norway" },
		{id: 170, label: "Oman" },
		{id: 171, label: "Pakistan" },
		{id: 172, label: "Palau Island" },
		{id: 173, label: "Palestine" },
		{id: 174, label: "Panama" },
		{id: 175, label: "Papua New Guinea" },
		{id: 176, label: "Paraguay" },
		{id: 177, label: "Peru" },
		{id: 178, label: "Philippines" },
		{id: 179, label: "Pitcairn Island" },
		{id: 180, label: "Poland" },
		{id: 181, label: "Portugal" },
		{id: 182, label: "Puerto Rico" },
		{id: 183, label: "Qatar" },
		{id: 184, label: "Republic of Montenegro" },
		{id: 185, label: "Republic of Serbia" },
		{id: 186, label: "Reunion" },
		{id: 187, label: "Romania" },
		{id: 188, label: "Russia" },
		{id: 189, label: "Rwanda" },
		{id: 190, label: "St Barthelemy" },
		{id: 191, label: "St Eustatius" },
		{id: 192, label: "St Helena" },
		{id: 193, label: "St Kitts-Nevis" },
		{id: 194, label: "St Lucia" },
		{id: 195, label: "St Maarten" },
		{id: 196, label: "St Pierre & Miquelon" },
		{id: 197, label: "St Vincent & Grenadines" },
		{id: 198, label: "Saipan" },
		{id: 199, label: "Samoa" },
		{id: 200, label: "Samoa American" },
		{id: 201, label: "San Marino" },
		{id: 202, label: "Sao Tome & Principe" },
		{id: 203, label: "Saudi Arabia" },
		{id: 204, label: "Senegal" },
		{id: 205, label: "Serbia" },
		{id: 206, label: "Seychelles" },
		{id: 207, label: "Sierra Leone" },
		{id: 208, label: "Singapore" },
		{id: 209, label: "Slovakia" },
		{id: 210, label: "Slovenia" },
		{id: 211, label: "Solomon Islands" },
		{id: 212, label: "Somalia" },
		{id: 213, label: "South Africa" },
		{id: 214, label: "Spain" },
		{id: 215, label: "Sri Lanka" },
		{id: 216, label: "Sudan" },
		{id: 217, label: "Suriname" },
		{id: 218, label: "Swaziland" },
		{id: 219, label: "Sweden" },
		{id: 220, label: "Switzerland" },
		{id: 221, label: "Syria" },
		{id: 222, label: "Tahiti" },
		{id: 223, label: "Taiwan" },
		{id: 224, label: "Tajikistan" },
		{id: 225, label: "Tanzania" },
		{id: 226, label: "Thailand" },
		{id: 227, label: "Togo" },
		{id: 228, label: "Tokelau" },
		{id: 229, label: "Tonga" },
		{id: 230, label: "Trinidad & Tobago" },
		{id: 231, label: "Tunisia" },
		{id: 232, label: "Turkey" },
		{id: 233, label: "Turkmenistan" },
		{id: 234, label: "Turks & Caicos Is" },
		{id: 235, label: "Tuvalu" },
		{id: 236, label: "Uganda" },
		{id: 237, label: "Ukraine" },
		{id: 238, label: "United Arab Emirates" },
		{id: 239, label: "United Kingdom" },
		{id: 240, label: "United States of America" },
		{id: 241, label: "Uruguay" },
		{id: 242, label: "Uzbekistan" },
		{id: 243, label: "Vanuatu" },
		{id: 244, label: "Vatican City State" },
		{id: 245, label: "Venezuela" },
		{id: 246, label: "Vietnam" },
		{id: 247, label: "Virgin Islands (Brit)" },
		{id: 248, label: "Virgin Islands (USA)" },
		{id: 249, label: "Wake Island" },
		{id: 250, label: "Wallis & Futana Is" },
		{id: 251, label: "Yemen" },
		{id: 252, label: "Zaire" },
		{id: 253, label: "Zambia" },
		{id: 254, label: "Zimbabwe" }];
		return {
			getCountryList: function() {
				return countryData;
			}
		};
	});
})();