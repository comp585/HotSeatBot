const request = require('request');

const actions = require('../constants');

const token = process.env.FB_PAGE_ACCESS_TOKEN;

const createRecipient = sender => ({
  id: sender,
});

const getApiHeader = () => ({
  url: 'https://graph.facebook.com/v2.6/me/messages',
  qs: { access_token: token },
});

const getPostHeader = () => ({
  method: 'POST',
});

const wrapRequest = req =>
  Object.assign(getApiHeader(), getPostHeader(), { json: req });

const wrapGenericMsg = (sender, req) =>
  Object.assign({ recipient: createRecipient(sender) }, { message: req });

const wrapTemplate = (sender, req) =>
  wrapGenericMsg(sender, { attachment: { type: 'template', payload: req } });

const sendMessage = message => {
  request(wrapRequest(message), (err, res) => {
    if (err) {
      console.log('Error sending messages: ', err);
    } else if (res.body.error) {
      console.log('Error: ', res.body.error);
    }
  });
};

const sendMessageAsync = (message, doneFunc) => {
  request(wrapRequest(message), (err, res) => {
    if (err) {
      console.log('Error sending messages: ', err);
    } else if (res.body.error) {
      console.log('Error: ', res.body.error);
    } else {
      doneFunc();
    }
  });
};

const createTextMessage = (sender, text) => {
  const messageData = { text };

  return wrapGenericMsg(sender, messageData);
};

const createPostbackButton = button => ({
  type: 'postback',
  title: button.title,
  payload: button.payload,
});

const createPostback = (sender, title, buttons) =>
  wrapTemplate(sender, {
    template_type: 'button',
    text: title,
    buttons: buttons.map(createPostbackButton),
  });

const createGeneric = (sender, topics, id) =>
  wrapTemplate(sender, {
    template_type: 'generic',
    elements: topics.map(topic => createElement(topic, id)),
  });

const createElement = (topic, id) => ({
  title: topic.category,
  buttons: [
    createPostbackButton({
      title: 'Choose',
      payload: actions.createPayload(
        actions.createTopicSelector(topic.category),
        id
      ),
    }),
  ],
});

const createQuestion = (sender, question, choices) =>
  wrapGenericMsg(sender, {
    text: question,
    quick_replies: choices.map(choice =>
      createQuickReply(choice.text, choice.payload)),
  });

const createQuickReply = (title, payload) => ({
  content_type: 'text',
  title,
  payload,
});

const getRandomQuestion = questions => {
  const index = Math.floor(Math.random() * questions.length);
  return questions[index];
};

module.exports = {
  token,
  sendMessage,
  createTextMessage,
  createPostback,
  createGeneric,
  createQuestion,
  getRandomQuestion,
  sendMessageAsync,
};
