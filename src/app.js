const express = require('express');
const bodyParser = require('body-parser');
const api = require('./api');
const topics = require('../data/topics');
const game = require('./db');

const sendMessage = api.sendMessage;
const createTextMessage = api.createTextMessage;
const createPostBack = api.createPostback;
const createGeneric = api.createGeneric;
const createQuestion = api.createQuestion;

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
  messagingEvents.forEach(event => {
    if (event.message) {
      if (event.message.quick_reply) {
        receivedReply(event);
      } else {
        receivedMessage(event);
      }
    } else if (event.postback) {
      receivedPostback(event);
    } else {
      console.log(`Webhook received unknown messagingEvent: ${event}`);
    }
  });
  res.sendStatus(200);
});

const receivedMessage = event => {
  const sender = event.sender.id;
  if (event.message && event.message.text) {
    switch (event.message.text.toLowerCase()) {
      case 'start': {
        const id = game.newGame();
        sendMessage(createTextMessage(sender, 'Choose a topic'));
        sendMessage(createGeneric(sender, topics, id));
        break;
      }
      default: {
        const text = event.message.text;
        sendMessage(
          createTextMessage(
            sender,
            `Text received, echo: ${text.substring(0, 200)}`
          )
        );
      }
    }
  }
};

const receivedReply = event => {
  const senderID = event.sender.id;
  const payload = event.message.quick_reply.payload;
  sendMessage(
    createTextMessage(senderID, `Quick reply with payload ${payload}`)
  );
};

const receivedPostback = event => {
  const senderID = event.sender.id;
  const payload = event.postback.payload;

  sendMessage(
    createTextMessage(senderID, `Postback called with payload ${payload}`)
  );
};
