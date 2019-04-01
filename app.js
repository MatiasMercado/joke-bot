'use strict';

// Dependencies
const express = require('express');
const bodyParser = require('body-parser')
;const app = express().use(bodyParser.json()); // TODO: Ch for URL encoded 

// Sets server port and logs message on success
const port = process.env.PORT || 1337; 
app.listen(port, () => console.log('webhook listening on port ' + port));
// TODO: Change console.log for logger 

// TODO: Send this file to routes/webhook.js and export the Router
app.post('/webhook', (req, res) => {  
 
  let body = req.body;

  // Check event is from page subscription 
  if (body.object === 'page') {

    body.entry.forEach(entry => {

      // entry.messaging is an array, but will only ever contain one message 
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    res.status(200).send('EVENT_RECEIVED'); // TODO: Send after completing event
  } else {
    res.sendStatus(404);
  }

});

app.get('/webhook', (req, res) => {

  let VERIFY_TOKEN = "7wyCOR562iYF1GS3forB"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  if (mode && token) {
  
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      res.sendStatus(403);      
    }
  }
});

