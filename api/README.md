# parcetrace/api

Express app built with Typescript. 

## Setup

1. Set up a Firestore database and make note of your credentials.

2. Create a LINE bot and gather its Channel Access Token.

3. Run Express app.

To run this app, there are a few environment variables that needed to be passed.

* API_KEY: API key for frontend.

* port: Application's port. Required to be 443 since LINE required your webhook endpoint to be HTTPS.

* cred: Path to Firestore's JSON credentials file.

* CAT: LINE bot's channel access token.

Then run the app in the `dist/` folder. (You can compile it yourself. I just include the compiled file here because my test server couldn't compile without hanging.)

`$ sudo API_KEY=apikey port=443 cred=/path/to/file.json CAT=channelaccesstoken node dist/app.js`
