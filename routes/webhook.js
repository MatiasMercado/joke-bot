'use strict';

const express = require('express');
const router = express.Router();
const webhookService = require('../services/webhookService.js');

router.post('/', (req, res) => {
 
  const body = req.body;

  // Check event is from page subscription 
  if (body.object === 'page') {

    body.entry.forEach(entry => {

      // entry.messaging is an array, but will only ever contain one message
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      const psid = webhookEvent.sender.id;
      console.log('Sender PSID: ' + psid);

      if (webhookEvent.message) {
        webhookService.handleMessage(psid, webhookEvent.message);        
      } else if (webhookEvent.postback) {
        webhookService.handlePostback(psid, webhookEvent.postback);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
} else {
    res.sendStatus(404);
  }

});

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
    
  if (mode && token) {
  
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      res.sendStatus(403);      
    }
  }
});

module.exports = router;
