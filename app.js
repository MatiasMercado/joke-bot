'use strict';

// Dependencies
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
;const app = express().use(bodyParser.url); // TODO: Ch for URL encoded 

const port = process.env.PORT || 1337; 
app.listen(port, () => console.log('webhook listening on port ' + port));
// TODO: Change console.log for logger 

let VERIFY_TOKEN = process.env.VERIFY_TOKEN;
console.log("verify_token: " + VERIFY_TOKEN)

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

  let VERIFY_TOKEN = process.env.VERIFY_TOKEN; // TODO: Set this var in Heroku
    
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

// FB Page Token (Probably to be used by the Send API)
// EAAEwkc2PbLgBAIQZAphsZAEUZCnyKVEySgC16DDVtyxeOPC550bq9yMJLW6qSs1uzryU8NeMZBrn1Sn1A6E2UZCDZB3CjzCc8sN52GZC1o5wGik6jfCown6LtccE9Ew8f6eC23bZCX3E2pu4s4EwF3MELnpoEZAZBi0ZAWr8Gnfw3FLywZDZD

