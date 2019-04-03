'use strict';

// Load dependencies
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const webhookRouter = require('./routes/webhook');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use('/webhook', webhookRouter);

// Start app
const port = process.env.PORT || 8080; 
app.listen(port);

