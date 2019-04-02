const request = require('request');

// Handles messages events
const handleMessage = (sender_psid, received_message) => {
  let response;

  console.log('Handling message');
  // Check if the message contains text
  if (received_message.text) {
  	console.log('Received text message');

  	request('https://api.icndb.com/jokes/random', (err, res, body) => {  
    	// TODO: Handle error
    	console.log(body);

    	response = {
      		"text": `You sent the message: "${received_message.text}".
      		Here's your prize: "${JSON.parse(body).value.joke}"`
		}
		console.log(response);
  		callSendAPI(sender_psid, response);
	});   
  }

  console.log('Handling message');    
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

module.exports = {
    handleMessage, 
    handlePostback
};
