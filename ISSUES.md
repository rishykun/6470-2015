[VERY IMPORTANT]
- instead of console.error, we need to return a fail message to the front end so that the server doesn't crash unnecessarily whenever any error occurs (FIX VERY FRAIL SERVER)
- settings
	change username
	change password if possible
- update to use username if available

Responsive design
- footer should come below boxes collaborated on mobile
- modal of upload is weird on mobile portrait

would like to do future features
- delete boxes
- message system/ contact users
- remember me

SETUPUSER CONTROLLER
closing modal should redirect to help if this is the first time
	or settings if this isnt the first time

PROFILE CONTROLLER
have profile specially mark complete boxes to distinguish them from incomplete boxes

GALLERY CONTROLLER
have gallery show upload button if box is incomplete and we can still upload to it

UPLOAD CONTROLLER
automatic filetype check and automatic conversion to one standard multimedia format for each multimedia
		.pdf for all text
		.mp3 for all music
		.mp4 for all videos
		etc.
thumbnails generator

minor issues/css
fix the scrollba for upload modal
make css of profile pretty