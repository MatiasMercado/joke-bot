'use strict';

// Load dependencies
require('dotenv').config();
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json()); // TODO: Ch for URL encoded 

// Listen on specified port
const port = process.env.PORT || 8080; 
app.listen(port, () => console.log('webhook listening on port ' + port));

// TODO: Send this file to routes/webhook.js and export the Router
app.post('/webhook', (req, res) => {  
 
  const body = req.body;

  // Check event is from page subscription 
  if (body.object === 'page') {

    body.entry.forEach(entry => {

      // entry.messaging is an array, but will only ever contain one message 
      const webhook_event = entry.messaging[0];
      console.log(webhook_event);

       // Get the sender PSID
      const sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    res.status(200).send('EVENT_RECEIVED'); // TODO: Send after completing event
  } else {
    res.sendStatus(404);
  }

});

app.get('/webhook', (req, res) => {

  const  VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    
  // Parse the query params
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
    
  if (mode && token) {
  
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      res.sendStatus(403);      
    }
  }
});

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Check if the message contains text
  if (received_message.text) {    

    // Create the payload for a basic text message
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an image!`
    }
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
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

