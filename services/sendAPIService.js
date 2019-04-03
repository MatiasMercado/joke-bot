'use strict';

const request = require('request');
const strings = require('../strings');

class SendAPIService {

	sendMessageAndButton(psid, text) {
		const response = { 
			"text": text, 
			"quick_replies": [{
				"content_type": "text",
				"title": strings.JOKE_BUTTON_TITLE,
				"payload": 'JOKE'
			}]
		};
		return this.sendMessage(psid, response);
	}

	sendMessage(psid, response) {
		const request_body = {
			"recipient": {
				"id": psid
			},
			"message": response
		};

		return new Promise((resolve, reject) => {
			request({
				"uri": process.env.FACEBOOK_API_URI,
				"qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
				"method": "POST",
				"json": request_body
			}, (err, res, body) => {
				if (err) {
					reject(err);
				} else {
					resolve(body);
				}
			}); 
		})
	}

	buildQuickReply(title) {
		return [{
			"content_type": "text",
			"title": title,
			"payload": title.toUpperCase()
		}]
	}
}

module.exports = SendAPIService;
