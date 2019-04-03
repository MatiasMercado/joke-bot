'use strict';

const request = require('request');
const logger = require('../config/logger');
const strings = require('../strings');
const SendAPIService = require('./sendAPIService');

const MAX_JOKES = parseInt(process.env.MAX_JOKES);
const RESET_TIME = parseInt(process.env.RESET_TIME);

const textCommands = {
	JOKE: 'JOKE',
	RESET: 'RESET',
	HELP: 'HELP' 
};

class WebhookService {

	constructor() {
		this.sendAPIService = new SendAPIService();
		this.usersMap = new Map();
	}

	handleMessage(psid, received_message) {
		if (received_message.text) {
			switch(received_message.text.toUpperCase()) {
				case textCommands.JOKE:
				return this.sendRandomJoke(psid);
				case textCommands.RESET:
				return this.resetJokesCount(psid);
				case textCommands.HELP:
				return this.sendHelpText(psid);
				default:
				return this.sendDefaultAnswer(psid);
			}
		}
	}

	handlePostback(psid, received_postback) {
		const payload = received_postback.payload;
		if (payload.toUpperCase() === 'START') {
			return this.sendAPIService.sendMessageAndButton(psid, 
				strings.START_TEXT);
		}
	}

	async sendRandomJoke(psid) {
		if (this.reachedJokesLimit(psid)) {
			return this.sendAPIService.sendMessageAndButton(psid, 
				strings.LIMIT_REACHED_TEXT);
		}
		let text;
		const jokesCount = this.usersMap.get(psid).jokesCount;
		try {
			const body = await this.fetchJoke();
			text = `${JSON.parse(body).value.joke}`;
			if (jokesCount + 1 == MAX_JOKES) { // Reached jokes limit
				this.setResetJokesTimer(psid);
			} else {
				this.usersMap.set(psid, { "jokesCount": jokesCount + 1 });
			}
		} catch(err) {
			text = strings.ICNDB_NOT_REACHED;
			logger.error('Unable to reach ICNDB: ' + err);
		}
		return this.sendAPIService.sendMessageAndButton(psid, text);
	}

	fetchJoke() {
		return new Promise((resolve, reject) => {
			request(process.env.ICNDB_API_URI + '/jokes/random?escape=javascript',
				(err, res, body) => { 
					if(err) {
						reject(err);
					} else {
						resolve(body);
					}
				})	
		})
	}

	setResetJokesTimer(psid) {
		const timeOut = setTimeout(() => this.resetJokesCount(psid), RESET_TIME);
		this.usersMap.set(psid, { "jokesCount": MAX_JOKES, timeOut });
	}

	resetJokesCount(psid) {
		let text;
		const userDetails = this.usersMap.get(psid);

		if (this.reachedJokesLimit(psid)) {
			clearTimeout(userDetails.timeOut);
			this.usersMap.set(psid, { jokesCount: 0 });
			text = strings.RESET_SUCCESS_TEXT;
		} else {
			text = strings.LIMIT_NOT_REACHED_TEXT;
		}
		return this.sendAPIService.sendMessageAndButton(psid, text);
	}

	sendHelpText(psid) {
		return this.sendAPIService.sendMessageAndButton(psid, 
			strings.HELP_TEXT);
	}

	sendDefaultAnswer(psid) {
		let text;
		if (this.reachedJokesLimit(psid)) {
			text = strings.LIMIT_REACHED_TEXT;
		} else {
			text = strings.DEFAULT_TEXT;
		}
		return this.sendAPIService.sendMessageAndButton(psid, text);
	}

	reachedJokesLimit(psid) {
		let jokesCount;
		if (this.usersMap.has(psid)) {
			jokesCount = this.usersMap.get(psid).jokesCount;	
		} else {
			jokesCount = 0;
			this.usersMap.set(psid, { "jokesCount": 0 });
		}

		if (jokesCount >= MAX_JOKES) {
			return true;
		}
		return false;
	}

	setSendAPIService(sendAPIService) {
		this.sendAPIService = sendAPIService;
	}

	getUsersMap() {
		return this.usersMap;
	}

	clearUsersMap() {
		this.usersMap.clear();
	}
}

module.exports = WebhookService;
