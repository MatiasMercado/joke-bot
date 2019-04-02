'use strict';

const request = require('request');
const strings = require('./strings.js');

const MAX_JOKES = process.env.MAX_JOKES;
const RESET_TIME = process.env.RESET_TIME;

const textCommands = {
	JOKE: 'JOKE',
	RESET: 'RESET',
	HELP: 'HELP' 
}

let usersMap = new Map();

const handleMessage = (psid, received_message) => {
	let response;

	if (received_message.text) {
		switch(received_message.text.toUpperCase()) {
			case textCommands.RESET:
				resetJokesCount(psid);
				break;
			case textCommands.HELP:
				response = { "text": strings.HELP_TEXT };
				callSendAPI(psid, response);
			break;
			case textCommands.JOKE:
				sendRandomJoke(psid);
				break;
			default:
				sendJokesButton(psid);
				break;
		}
	}
}

const handlePostback = (psid, received_postback) => {
	const payload = received_postback.payload;

	if (payload.toUpperCase() === 'JOKE') {
		sendRandomJoke(psid);
	}
}

const callSendAPI = (psid, response) => {
	const request_body = {
		"recipient": {
			"id": psid
		},
		"message": response
	};

	request({
		"uri": process.env.FACEBOOK_API_URI,
		"qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		if (!err) {
			console.log('Message sent!')
		} else {
			console.error('Unable to send message: ' + err);
		}
	}); 
}

const sendRandomJoke = psid => {
	let jokesCount;

	if (usersMap.has(psid)) {
		jokesCount = usersMap.get(psid).jokesCount;	
	} else {
		jokesCount = 0;
		usersMap.set(psid, { jokesCount: 0 });
	}

	if (jokesCount >= MAX_JOKES) {
		const response = {
			"text": strings.LIMIT_REACHED_TEXT
		};
		callSendAPI(psid, response);
	} else {
		request(process.env.ICNDB_API_URI + '/jokes/random?escape=javascript',
			(err, res, body) => {  
	    	// TODO: Handle error
	    	const response = { "text": `${JSON.parse(body).value.joke}` };

			// Increase the jokes count for the sender
			if (jokesCount + 1 == MAX_JOKES) {
				const timeOut = setTimeout(() => resetJokesCount(psid), 
					RESET_TIME);
				usersMap.set(psid, { jokesCount: jokesCount + 1, timeOut });
			} else {
				usersMap.set(psid, { jokesCount: jokesCount + 1 });
			}
			
			callSendAPI(psid, response);
		}); 
	}
}

const resetJokesCount = psid => {
	let response;
	const userDetails = usersMap.get(psid);
	
	if (!userDetails || userDetails.jokesCount < MAX_JOKES 
		|| !userDetails.timeOut) {
		response = { "text": strings.LIMIT_NOT_REACHED_TEXT };
	} else {
		clearTimeout(userDetails.timeOut);
		usersMap.set(psid, { jokesCount: 0 });
		response = { "text": strings.RESET_SUCCESS_TEXT };
	}
	callSendAPI(psid, response);
}

const sendJokesButton = psid => {
	const response = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "button",
				"text": strings.DEFAULT_TEXT,
				"buttons": [
				{
					"type": "postback",
					"title": "Joke",
					"payload": "JOKE",
				}]
			}
		}
	};
 	callSendAPI(psid, response);
};


module.exports = {
	handleMessage, 
	handlePostback
};
