const MAX_JOKES = process.env.MAX_JOKES;
const RESET_TIME = process.env.RESET_TIME;

module.exports = Object.freeze({
	START_TEXT: `Welcome to JokeBot! Send "joke" to get amazing Chuck Norris facts! \
You can ask for ${MAX_JOKES} jokes a day. Remember you can send "help" \
if you get stuck!`,
	JOKE_BUTTON_TITLE: `Joke`,
	HELP_TEXT: `Send "joke" to get amazing Chuck Norris facts! \
Reached your limit already? Send "reset" to get a new daily dose!.`,
	DEFAULT_TEXT: `Press the button to get a joke! Send "help" if you get stuck.`,
	LIMIT_REACHED_TEXT: `Oops. You've reached your daily limit \
of ${MAX_JOKES} jokes. Can't wait? Send "reset" and \
get a new daily dose!`,
	LIMIT_NOT_REACHED_TEXT: `It seems you still haven't reached your \
daily limit. Ask me for a joke!`, 
	RESET_SUCCESS_TEXT: `All clear. You can ask for ${MAX_JOKES} \
new jokes!`,
	ICNDB_NOT_REACHED: `We're sorry, it seems there was an error getting your jokes.`,
	UNKNOWN_TEXT: `Sorry, I didn't get that.`
});
