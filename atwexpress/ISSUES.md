issues:
- what happens if u log in at the same time from multiple locations
- why is login slow for windows

- why profile gets called 6 times
why is Created and Collaborated populateed 6 times (appended) instead of resetting and adding

todo:
- initial resize of sign modal doesn't work
- if user goes to /signin state, closes modal, and tries to click login locally, the modal won't repop,
	that's becuz the state didnt change, its still signin,
	should have modal close redirect state
- remember me
-add user field for signup/signin
-receive
-automatically generate item.config for each upload
-prevent access to functions to stuff like get profile and shit if we're not logged in (use the isLoggedIn)
- overwriting users & folders and in general in aws s3 server
	prevent overwrite
reserver certain words (to prevent overwrite of necessary initial items)