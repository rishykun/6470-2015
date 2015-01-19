issues:
- attempt login with wrong credentials,
	then login properly
	gives "error authenticating to server"

- what happens if u log in at the same time from multiple locations
- why is login slow for windows

- why profile gets called 6 times
why is Created and Collaborated populateed 6 times (appended) instead of resetting and adding

todo:
-automatically generate item.config for each upload
-prevent access to functions to stuff like get profile and shit if we're not logged in (use the isLoggedIn)
-add user field for signup/signin
- overwriting users & folders and in general in aws s3 server
	prevent overwrite
reserver certain words (to prevent overwrite of necessary initial items)