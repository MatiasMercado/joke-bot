'use strict';

// Load dependencies
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
var webhookRouter = require('./routes/webhook');

const app = express();
app.use(bodyParser.json()); // TODO: Ch for URL encoded 
app.use('/webhook', webhookRouter);

// Listen on specified port
const port = process.env.PORT || 8080; 
app.listen(port, () => console.log('webhook listening on port ' + port));
