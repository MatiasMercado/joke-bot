'use strict';

const request = require('request');

const textCommands = {
	JOKE: 'JOKE',
	RESET: 'RESET',
	HELP: 'HELP' 
}

const MAX_JOKES = 3;
const RESET_TIME = 1000 * 60 * 60 * 24;

// <psid, { jokesCount: 0, timeout: XXX, fromDate: }>
let usersMap = new Map();

// Handles messages events
const handleMessage = (psid, received_message) => {
  let response;

  if (received_message.text) {
  	switch(received_message.text.toUpperCase()) {
		case textCommands.RESET:
			resetJokesCount(psid);
			break;
		case textCommands.HELP:
			const helpText = `Send "joke" to get amazing Chuck Norris facts!
      			Reached your limit already? Send "reset" to get 
      			a new daily dose!.`; 
			response = {
      			"text": helpText
			};
			callSendAPI(psid, response);
			break;
		case textCommands.JOKE:
			sendRandomJoke(psid);
			break;
		default:
			response = {
      			"text": `Sorry, I didn't get that.`
			};
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
    "uri": "https://graph.facebook.com/v2.6/me/messages",
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

const sendRandomJoke = (psid) => {
	let jokesCount;
	if (usersMap.has(psid)) {
		jokesCount = usersMap.get(psid).jokesCount;	
	} else {
		jokesCount = 0;
		usersMap.set(psid, { jokesCount: 0 });
	}

	if (jokesCount >= MAX_JOKES) {
		// TODO: Add "You can get more in Date() - fromDate."
		const maxLimitText = `Oops. You've reached your daily limit 
		of ${MAX_JOKES} jokes. Need more? Send "reset" and 
		get a new daily dose!`;
		const response = {
      			"text": maxLimitText
		};
		callSendAPI(psid, response);
	} else {
		request('https://api.icndb.com/jokes/random', (err, res, body) => {  
    	// TODO: Handle error
    	const response = {
      		"text": `${JSON.parse(body).value.joke}`
		};

		// Increase the jokes count for the sender
		if (jokesCount + 1 == MAX_JOKES) {
			const timeOut = setTimeout(() => resetJokesCount(psid), RESET_TIME);
			usersMap.set(psid, { jokesCount: jokesCount + 1, timeOut });
		} else {
			usersMap.set(psid, { jokesCount: jokesCount + 1 });
		}

  		callSendAPI(psid, response);
	}); 
	}
}

// TODO: Solve what happens if they call RESET before ever calling JOKE
const resetJokesCount = (psid) => {
	let response;
	const userDetails = usersMap.get(psid);
	
	if (!userDetails || userDetails.jokesCount < MAX_JOKES 
		|| !userDetails.timeOut) {
		const limitNotReachedText = `It seems you still haven't reached your 
		daily limit. Ask me for a joke!`;
		response = {
      			"text": limitNotReachedText
		};
	}
	else {
		clearTimeout(userDetails.timeOut);
		usersMap.set(psid, { jokesCount: 0 });
		const resetSuccessText = `All clear. You can ask for ${MAX_JOKES} 
		new jokes!.`;
		response = {
      			"text": resetSuccessText
		};
	}
	callSendAPI(psid, response);
}

module.exports = {
    handleMessage, 
    handlePostback
};
