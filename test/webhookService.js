'use strict';

// Load dependencies
require('dotenv').config();
const chai = require('chai');
const spies = require('chai-spies');
const WebhookService = require('../services/webhookService');
const SendAPIService = require('../services/sendAPIService');
const strings = require('../strings');
chai.use(spies);

const should = chai.should();

// Set test consts
const MAX_JOKES = parseInt(process.env.MAX_JOKES);
const RESET_TIME = parseInt(process.env.RESET_TIME);
const psid = 7000;
const defaultJokeText = "Chuck Norris sleeps with a pillow below his gun";
const defaultJoke = `{ "value": { "joke" : "Chuck Norris sleeps with a pillow below his gun" }}`
const jokeQuickReply = [{
	"content_type": "text",
	"title": 'Joke',
	"payload": 'JOKE'
}]; 

const webhookService = new WebhookService();

// Mock the ICNDB call to return always the same joke 
chai.spy.on(WebhookService.prototype, 'fetchJoke', () => 
	Promise.resolve(defaultJoke));

describe('WebhookService#handleMessage', () => {

	let spy;
	
	beforeEach(() => {
		spy = chai.spy.interface("SendAPIService", ['sendMessageAndButton']);
		webhookService.setSendAPIService(spy);
		webhookService.clearUsersMap();

	})

	describe('when receiving "joke"', () => {

		it('should return a joke', async () => {
			await webhookService.handleMessage(psid, { "text": 'joke' });
			
			spy.sendMessageAndButton.should.have.been.called
			.once.with.exactly(psid, defaultJokeText);
			
			webhookService.getUsersMap().get(psid).jokesCount.should.equal(1);
		})

		it('should return LIMIT_REACHED after MAX_JOKES jokes', async () => {
			for (let i=0; i < MAX_JOKES + 1; i++) {
				await webhookService.handleMessage(psid, { "text": 'joke' });
			}

			spy.sendMessageAndButton.should.have.been.called
			.exactly(MAX_JOKES+1);

			spy.sendMessageAndButton.should.on.nth(MAX_JOKES+1)
			.be.called.with.exactly(psid, strings.LIMIT_REACHED_TEXT);

			webhookService.getUsersMap().get(psid).jokesCount.should.equal(MAX_JOKES);
		})
	})

	describe('when receiving "reset"', () => {

		it('should return LIMIT_NOT_REACHED when jokesCount < MAX_JOKES', async () => {
			await webhookService.handleMessage(psid, { "text": 'reset' });

			spy.sendMessageAndButton.should.have.been
			.called.with.exactly(psid, strings.LIMIT_NOT_REACHED_TEXT);
		})

		it('should return RESET_SUCCESS_TEXT after reset', async () => {
			for (let i=0; i < MAX_JOKES; i++) {
				await webhookService.handleMessage(psid, { "text": 'joke' });
			}

			webhookService.handleMessage(psid, { "text": 'reset' });

			spy.sendMessageAndButton.should.have.been.called
			.exactly(MAX_JOKES+1);

			spy.sendMessageAndButton.should.on.nth(MAX_JOKES+1)
			.be.called.with.exactly(psid, strings.RESET_SUCCESS_TEXT);
		})
	})

	describe('when receiving "help"', () => {

		it('should return HELP_TEXT', async () => {
			await webhookService.handleMessage(psid, { "text": 'help' });

			spy.sendMessageAndButton.should.have.been
			.called.with.exactly(psid, strings.HELP_TEXT);
		})
		
	})

	describe('when receiving any other text', () => {

		it('should return LIMIT_REACHED after MAX_JOKES jokes', async () => {
			for (let i=0; i < MAX_JOKES; i++) {
				await webhookService.handleMessage(psid, { "text": 'joke' });
			}

			await webhookService.handleMessage(psid, { "text": 'Hi Bot!' });

			spy.sendMessageAndButton.should.have.been.called
			.exactly(MAX_JOKES+1);

			spy.sendMessageAndButton.should.on.nth(MAX_JOKES+1)
			.be.called.with.exactly(psid, strings.LIMIT_REACHED_TEXT);
		})

		it('should return DEFAULT_TEXT otherwise', async () => {
			await webhookService.handleMessage(psid, { "text": 'Hi Bot!' });

			spy.sendMessageAndButton.should.have.been
			.called.with.exactly(psid, strings.DEFAULT_TEXT);
		})
	})
});
