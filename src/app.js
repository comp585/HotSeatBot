const express = require('express');
const bodyParser = require('body-parser');
const api = require('./api');

const sendMessage = api.sendMessage;
const createTextMessage = api.createTextMessage;

const app = express();

app.set('port', process.env.PORT || 5000);

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', (req, res) => {
  res.send('Hello world, I am a chat bot');
});

// for Facebook verification
app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
});

// Spin up the server
app.listen(app.get('port'), () => {
  console.log('running on port', app.get('port'));
});

// webhook endpoint
app.post('/webhook/', (req, res) => {
  const messagingEvents = req.body.entry[0].messaging;

  // iterate over the messages in batch
  messagingEvents.forEach((event) => {
    const sender = event.sender.id;
    if (event.message && event.message.text) {
      const text = event.message.text;
      sendMessage(
        createTextMessage(sender, `Text received, echo: ${text.substring(0, 200)}`)
      );
    }
  });
  res.sendStatus(200);
});

