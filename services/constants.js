const MAX_JOKES = process.env.MAX_JOKES;
const RESET_TIME = process.env.RESET_TIME;
// const RESET_TIME = 1000 * 60 * 60 * 24; // 86400000 ms

module.exports = Object.freeze({
	HELP_TEXT: `Send "joke" to get amazing Chuck Norris facts! \
Reached your limit already? Send "reset" to get a new daily dose!.`,
	DEFAULT_TEXT: `Sorry, I didn't get that.`,
	LIMIT_REACHED_TEXT: `Oops. You've reached your daily limit \
of ${MAX_JOKES} jokes. Need more? Send "reset" and \
get a new daily dose!.`,
	LIMIT_NOT_REACHED_TEXT: `It seems you still haven't reached your \
daily limit. Ask me for a joke!`, 
	RESET_SUCCESS_TEXT: `All clear. You can ask for ${MAX_JOKES} \
new jokes!.`
});
