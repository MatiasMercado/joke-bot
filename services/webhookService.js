'use strict';

const request = require('request');
const constants = require('./constants.js');

const MAX_JOKES = constants.MAX_JOKES;
const RESET_TIME = constants.RESET_TIME;

const textCommands = {
	JOKE: 'JOKE',
	RESET: 'RESET',
	HELP: 'HELP' 
}

// <psid, { jokesCount: 0, timeout: XXX, fromDate: }>
let usersMap = new Map();

const handleMessage = (psid, received_message) => {
  let response;

  if (received_message.text) {
  	switch(received_message.text.toUpperCase()) {
		case textCommands.RESET:
			resetJokesCount(psid);
			break;
		case textCommands.HELP:
			response = { "text": constants.HELP_TEXT };
			callSendAPI(psid, response);
			break;
		case textCommands.JOKE:
			sendRandomJoke(psid);
			break;
		default:
			response = { "text": constants.DEFAULT_TEXT };
			callSendAPI(psid, response);
			break;
  	}
  }
}

// Handles messaging_postbacks events
const handlePostback = (psid, received_postback) => {

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
		// TODO: Add "You can get more in Date() - fromDate."
		const response = {
      			"text": constants.LIMIT_REACHED_TEXT
		};
		callSendAPI(psid, response);
	} else {
		request(process.env.ICNDB_API_URI + '/jokes/random', (err, res, body) => {  
	    	// TODO: Handle error
	    	const response = { "text": `${JSON.parse(body).value.joke}` };
	    	
			// Increase the jokes count for the sender
			if (jokesCount + 1 == MAX_JOKES) {
				const timeOut = setTimeout(() => resetJokesCount(psid), 
					constants.RESET_TIME);
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
		response = { "text": constants.LIMIT_NOT_REACHED };
	}
	else {
		clearTimeout(userDetails.timeOut);
		usersMap.set(psid, { jokesCount: 0 });
		response = { "text": constants.RESET_SUCCESS_TEXT };
	}
	callSendAPI(psid, response);
}

module.exports = {
    handleMessage, 
    handlePostback
};
