const request = require('request');

const textCommands = {
	JOKE: 'JOKE',
	RESET: 'RESET',
	HELP: 'HELP' 
}

// Handles messages events
const handleMessage = (sender_psid, received_message) => {
  let response;

  if (received_message.text) {
  	switch(received_message.text.toUpperCase()) {
		case textCommands.RESET:
			break;
		case textCommands.HELP:
			response = {
      			"text": `This is your help text!`
			}
			callSendAPI(sender_psid, response);
			break;
		case textCommands.JOKE:
			sendRandomJoke(sender_psid);
			break;
		default:
			response = {
      			"text": `You are not as funny as I am.`
			}
			callSendAPI(sender_psid, response);
			break;
  	}
  }
}

// Handles messaging_postbacks events
const handlePostback = (sender_psid, received_postback) => {

}

// Sends response messages via the Send API
const callSendAPI = (sender_psid, response) => {
   // Construct the message body
  const request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

    // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('Message sent!')
    } else {
      console.error("Unable to send message: " + err);
    }
  }); 
}

const sendRandomJoke = (sender_psid) => {
	request('https://api.icndb.com/jokes/random', (err, res, body) => {  
    	// TODO: Handle error
    	response = {
      		"text": `${JSON.parse(body).value.joke}`
		}
  		callSendAPI(sender_psid, response);
	});   
}

module.exports = {
    handleMessage, 
    handlePostback
};
