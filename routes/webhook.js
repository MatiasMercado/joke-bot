'use strict';

const express = require('express');
const router = express.Router();
const WebhookService = require('../services/webhookService');
const logger = require('../config/logger');

const webhook = new WebhookService();

router.post('/', (req, res) => {

  const body = req.body;

  // Check event is from page subscription 
  if (body.object === 'page') {

    body.entry.forEach(entry => {

      // entry.messaging is an array, but will only ever contain one message
      const webhookEvent = entry.messaging[0];
      const psid = webhookEvent.sender.id;

      if (webhookEvent.message) {
        webhook.handleMessage(psid, webhookEvent.message)
        .catch(err => logger.error(err))
      } else if (webhookEvent.postback) {
        webhook.handlePostback(psid, webhookEvent.postback)
        .catch(err => logger.error(err))
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
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);      
    }
  }
});

module.exports = router;
