issues:
- what happens if u log in at the same time from multiple locations

todo:
- add user field for signup/signin [UNRESOLVED]
- receive (need checks)
- upload:
	a. add options to uploading (setting title, description, etc.)
	b. automatic filetype check and automatic conversion to one standard multimedia format for each multimedia
		.pdf for all text
		.mp3 for all music
		.mp4 for all videos
		etc.
	c. upon upload success or fail, display growl message
	d. add a more obvious path to get to uploads (upload button)?
	e. change state and go back ruins upload
	f. thumbnails generator
	g. closing upload modal if we arrived to it from creating a box should RESET THE CURRENT BOX
- refactor:
	put main controller's resize in its own controller/factory/whatever
- responsive design
	sites that generate the three bars when browser window is small:
		http://www.memsql.com/
		http://www.neople.co.kr/neople/en/neople.php
- initial resize of sign modal doesn't work [UNRESOLVED]
- remember me
- overwriting users & folders and in general in aws s3 server
	prevent overwrite
- delete boxes
- reserve certain words (to prevent overwrite of necessary initial items)
- message system/ contact users