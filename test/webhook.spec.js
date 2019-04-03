// TODO: Rename file

// Tests:
// Run the project locally

// Test 1: Verify the GET against webhook
// curl -X GET "localhost:1337/webhook?hub.verify_token=<YOUR_VERIFY_TOKEN>&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"

// Test 2: Get a Joke
// curl -H "Content-Type: application/json" -X POST "localhost:1337/webhook" -d '{"object": "page", "entry": [{"messaging": [{"message": "TEST_MESSAGE"}]}]}'

// Test 3: Get more than 10 jokes

// Test 1
// Exepct webhookService.handleMessage(ID, {Joke}) to call ICNDB API with XX ?
// Expect third call to not call API?

// Call a Reset
// Expect I get joke again

// Test 2
// Expect webhookService.handlePostback(ID, {Joke}) to return joke (Meaning call FB API)
