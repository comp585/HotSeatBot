const express = require('express');
const bodyParser = require('body-parser');
const actions = require('./constants');
const controller = require('./controller');

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
      default: {
        const text = event.message.text;
        controller.handleDefaultMessage(sender, text);
      }
    }
  }
};

const receivedReply = event => {
  const senderID = event.sender.id;
  const payload = event.message.quick_reply.payload;
  if (
    payload.startsWith(actions.SET_TRUTH) || payload.startsWith(actions.SET_LIE)
  ) {
    controller.handleChoiceSet(senderID, payload);
  } else if (payload.startsWith(actions.DONE)) {
    controller.handleConversationDone(senderID, payload);
  } else if (
    payload.startsWith(actions.SELECT_TRUTH) ||
    payload.startsWith(actions.SELECT_LIE)
  ) {
    controller.handleChoiceSelection(senderID, payload);
  } else {
    controller.handleDefaultReply(senderID, payload);
  }
};

const receivedPostback = event => {
  const senderID = event.sender.id;
  const payload = event.postback.payload;

  if (actions.isGetStartedPayload(payload)) {
    controller.handleStart(senderID, topics);
  } else if (actions.isTopicSelection(payload)) {
    controller.handleTopicSelect(senderID, payload);
  } else {
    controller.handleDefaultPostback(senderID, payload);
  }
};
