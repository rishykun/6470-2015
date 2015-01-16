issues:
- attempt login with wrong credentials,
	then login properly
	gives "error authenticating to server"

- what happens if u log in at the same time from multiple locations

todo:
- make sure not to send request to server if form is not filled out (mandatory fields are empty)
- wrong login should return an error message
- successful login should return a message
- overwriting users & folders and in general in aws s3 server