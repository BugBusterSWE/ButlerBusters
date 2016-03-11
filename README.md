# ButlerBusters

A bot to join Teamwork with Github.
If you have a organization and you work with Teamwork this application is for you.

## Installation

Download this repo in your server and create **config.json** file. This file storage the main informations need to
communicate with Teamwork and Github. This is model that you must write:
```json
{
	"users": {
	"
		// The pair 'id_teamwork_user': 'username_github', in this way
		// any event  attached at the Teamwork user will assiociade at a
		// Github user.

		// For example:
		// 123456789: myUser
	"
	},

	"organization": "Name of yours GitHub organization or user",
	"user": "Nick of your bot to send Github notification",
	"pass": "Password of your bot",
	"api_key": "Api Key of your bot",
	"teamwork_website": "Teamwork site web that your organization use",
	"mail_box": "Id of the Teamwork's messages box to send notification"
}
```
