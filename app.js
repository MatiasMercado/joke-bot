'use strict';

// Load dependencies
require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const webhookRouter = require('./routes/webhook');

const app = express();
app.use(logger('dev')); // TODO: Leave empty to output 'default' format
app.use(bodyParser.json()); // TODO: Ch for URL encoded 
app.use('/webhook', webhookRouter);

// Start app
const port = process.env.PORT || 8080; 
app.listen(port, () => console.log('webhook listening on port ' + port));
