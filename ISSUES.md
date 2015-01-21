issues:
- what happens if u log in at the same time from multiple locations
- why is login slow for windows

todo:
- add user field for signup/signin [UNRESOLVED]
- receive
- upload:
	a. add options to uploading (setting title, description, etc.)
	b. upon upload success or fail, display growl message
	c. add a more obvious path to get to uploads (upload button)?
- refactor:
	put auth as part of userprofile
	put main controller's resize in its own controller/factory/whatever
	move box config and stuff like that out of main controller and into a service (maybe box or boxlist)
- initial resize of sign modal doesn't work
- remember me
- overwriting users & folders and in general in aws s3 server
	prevent overwrite
- reserve certain words (to prevent overwrite of necessary initial items)