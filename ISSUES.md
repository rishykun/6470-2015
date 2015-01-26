todo:
- add user field for signup/signin [UNRESOLVED]
- modal resize
- responsive design
	sites that generate the three bars when browser window is small:
		http://www.memsql.com/
		http://www.neople.co.kr/neople/en/neople.php

would like to do future features
- delete boxes
- message system/ contact users
- remember me

PROFILE CONTROLLER
have profile specially mark complete boxes to distinguish them from incomplete boxes

GALLERY CONTROLLER
have gallery only view if box is complete
have gallery show upload button if box is incomplete and we can still upload to it
have box only just show stuff u've uploaded to if incomplete


UPLOAD CONTROLLER
limit user upload
closing upload modal should return to previous state (profile or home; store prevState as variable)
	and RESET the current box
automatic filetype check and automatic conversion to one standard multimedia format for each multimedia
		.pdf for all text
		.mp3 for all music
		.mp4 for all videos
		etc.
thumbnails generator

move size check from server-side to client-side
[VERY IMPORTANT] instead of console.error, we need to return a fail message to the front end so that the server doesn't crash unnecessarily whenever any error occurs (FIX VERY FRAIL SERVER)

minor issues/css
hide jasmine toolbar
fix the scrollbar for upload modal

would like to do
responsive design
	three bar menu when site is small
	responsive grid gui (text automatically goes to two lines when screen is small)