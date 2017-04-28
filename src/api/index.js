const Promise = require('bluebird');
const request = Promise.promisify(require('request'), { multiArgs: true });
const async = require('asyncawait/async');
const asyncAwait = require('asyncawait/await');
const dedent = require('dedent-js');

Promise.promisifyAll(request, { multiArgs: true });

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

const createRequest = message => wrapRequest(message);

const sendMessage = message => {
  request(createRequest(message), (err, res) => {
    if (err) {
      console.log('Error sending messages: ', err);
    } else if (res.body.error) {
      console.log('Error: ', res.body.error);
    }
  });
};

const sendMessages = async(messages => {
  for (let i = 0; i < messages.length; i += 1) {
    asyncAwait(request(createRequest(messages[i])));
  }
});

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

const createGenericView = (sender, elements) =>
  wrapTemplate(sender, { template_type: 'generic', elements });

const createGeneric = (sender, topics, id) =>
  createGenericView(sender, topics.map(topic => createElement(topic, id)));

const createElementView = (title, subtitle, buttons) => ({
  title,
  subtitle,
  buttons,
});

const createElement = (topic, id) =>
  createElementView(topic.category, '', [
    createPostbackButton({
      title: 'Choose',
      payload: actions.createPayload(
        actions.createTopicSelector(topic.category),
        id
      ),
    }),
  ]);

const createQuestion = (sender, question, choices) =>
  wrapGenericMsg(sender, {
    text: question,
    quick_replies: choices.map(choice =>
      createQuickReply(choice.text, choice.payload, choice.image_url)),
  });

const createQuickReply = (title, payload, imageUrl) => ({
  content_type: 'text',
  title,
  payload,
  image_url: imageUrl,
});

const getRandomQuestion = questions => {
  const index = Math.floor(Math.random() * questions.length);
  return questions[index];
};

const getTellerIndex = (round, players) => round % players.length;

const getTeller = (round, players) =>
  players[getTellerIndex(round, players)].emoji;

const getInvestigators = (round, players) => {
  const tellerIndex = getTellerIndex(round, players);
  return players
    .filter((player, index) => index !== tellerIndex)
    .map(player => player.emoji);
};

const createRoundView = (sender, round, players) => {
  const scoreMsg = players
    .map(player => `${player.emoji}: ${player.score}`)
    .join('\n');
  const msg = dedent`
    Here is the current score:
    ${scoreMsg}
    `;

  return createTextMessage(sender, msg);
};

module.exports = {
  token,
  sendMessage,
  createTextMessage,
  createPostback,
  createGeneric,
  createGenericView,
  createElementView,
  createQuestion,
  createPostbackButton,
  createRoundView,
  getRandomQuestion,
  sendMessages,
  getTeller,
  getInvestigators,
};
