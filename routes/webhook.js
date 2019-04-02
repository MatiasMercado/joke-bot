const express = require('express');
const router = express.Router();
const webhookService = require('../services/webhookService.js');

router.post('/', (req, res) => {
 
  const body = req.body;

  // Check event is from page subscription 
  if (body.object === 'page') {

    body.entry.forEach(entry => {

      // entry.messaging is an array, but will only ever contain one message
      const webhook_event = entry.messaging[0];
      console.log(webhook_event);

      const sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      if (webhook_event.message) {
        webhookService.handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        webhookService.handlePostback(sender_psid, webhook_event.postback);
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
