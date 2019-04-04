'use strict';

// Load dependencies
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const logger = require('./config/logger');
const webhookRouter = require('./routes/webhook');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use('/webhook', webhookRouter);

// error handler
app.use((err, req, res, next) => {
  	logger.error(err);
  	res.sendStatus(err.status || 500);
});

// Start app
const port = process.env.PORT || 8080; 
app.listen(port);
