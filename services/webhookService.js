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
			case textCommands.JOKE:
			sendRandomJoke(psid);
			break;
			case textCommands.RESET:
			resetJokesCount(psid);
			break;
			case textCommands.HELP:
			response = { 
				"text": strings.HELP_TEXT, 
				"quick_replies": buildQuickReply("Joke")
			};
			callSendAPI(psid, response);
			break;
			default:
			sendDefaultAnswer(psid);
			break;
		}
	}
}

const handlePostback = (psid, received_postback) => {
	const payload = received_postback.payload;

	if (payload.toUpperCase() === 'START') {
		const response = { 
			"text": strings.START_TEXT, 
			"quick_replies": buildQuickReply("Joke")
		};
		callSendAPI(psid, response);
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
		if (err) {
			console.error('Unable to reach facebook API: ' + err);
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
			"text": strings.LIMIT_REACHED_TEXT, 
			"quick_replies": buildQuickReply("Joke") 
		};
		callSendAPI(psid, response);
	} else {
		request(process.env.ICNDB_API_URI + '/jokes/random?escape=javascript', 
			(err, res, body) => {  
			
			let text;

	    	// Handle error on API call
	    	if (err) {
	    		text = strings.ICNDB_NOT_REACHED;
	    		console.error('Unable to reach ICNDB: ' + err);
	    	} else {
	    		try {
	    			text = `${JSON.parse(body).value.joke}`;
	    		} catch {
	    			text = strings.ICNDB_NOT_REACHED;
	    			console.error('Error parsing ICNDB response ' + body);
	    		}	
	    	}

	    	const response = { 
	    		"text": text, 
	    		"quick_replies": buildQuickReply("Joke")
	    	};

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
	let text;
	const userDetails = usersMap.get(psid);
	
	if (!usersMap.has(psid) || userDetails.jokesCount < MAX_JOKES || !userDetails.timeOut) {
		text = strings.LIMIT_NOT_REACHED_TEXT;
	} else {
		clearTimeout(userDetails.timeOut);
		usersMap.set(psid, { jokesCount: 0 });
		text = strings.RESET_SUCCESS_TEXT;
	}
	const response = { 
		"text": text, 
		"quick_replies": buildQuickReply("Joke")
	};
	callSendAPI(psid, response);
}

const sendDefaultAnswer = psid => {
	let response;
	if (usersMap.has(psid) && usersMap.get(psid).jokesCount >= MAX_JOKES) {
		response = { 
			"text": strings.LIMIT_REACHED_TEXT, 
			"quick_replies": buildQuickReply("Joke")
		};
	} else {
		response = { 
			"text": strings.DEFAULT_TEXT, 
			"quick_replies": buildQuickReply("Joke")
		};
		
	}
	callSendAPI(psid, response);
}

const buildQuickReply = title => {
	return [{
		"content_type": "text",
		"title": title,
		"payload": title.toUpperCase()
	}]
}

module.exports = {
	handleMessage, 
	handlePostback
};
