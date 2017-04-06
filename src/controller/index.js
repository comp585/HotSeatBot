const actions = require('../constants');
const api = require('../api');
const db = require('../db');
const getQuestions = require('../db/topics').getQuestions;

const sendMessage = api.sendMessage;
const sendMessages = api.sendMessages;
const createTextMessage = api.createTextMessage;
const createGeneric = api.createGeneric;
const createQuestion = api.createQuestion;

module.exports = {
  handleStart: (sender, topics) => {
    const id = db.newGame();
    sendMessages([
      createTextMessage(sender, 'Choose a topic'),
      createGeneric(sender, topics, id),
    ]);
  },

  handleDefaultMessage: (sender, text) => {
    sendMessage(
      createTextMessage(
        sender,
        `Text received, echo: ${text.substring(0, 200)}`
      )
    );
  },

  handleTopicSelect: (sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    const topic = actions.getTopic(payload);
    const questions = getQuestions(topic);
    const question = api.getRandomQuestion(questions);

    sendMessage(
      createQuestion(sender, `Question: ${question}`, [
        {
          text: 'Truth',
          payload: actions.createPayload(actions.SET_TRUTH, gameID),
          image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Green_check.svg/480px-Green_check.svg.png',
        },
        {
          text: 'False',
          payload: actions.createPayload(actions.SET_LIE, gameID),
          image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Red_X.svg/768px-Red_X.svg.png',
        },
      ])
    );
  },

  handleChoiceSet: (sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    db.setAnswer(gameID, payload.startsWith(actions.SET_TRUTH));
    sendMessage(
      createQuestion(sender, 'Teller answer the question.', [
        {
          text: 'Done',
          payload: actions.createPayload(actions.DONE, gameID),
          image_url: 'https://cdn.pixabay.com/photo/2014/04/02/10/58/chick-305108_960_720.png',
        },
      ])
    );
  },

  handleChoiceSelection: (sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    const answer = db.getAnswer(gameID);
    if (answer === undefined) {
      sendMessage(createTextMessage(sender, 'Sorry, game data not found'));
    } else {
      const res = payload.startsWith(actions.SELECT_TRUTH);
      const resMsg = res === answer
        ? 'Investigator wins this round!'
        : 'Teller wins this round!';
      sendMessage(createTextMessage(sender, resMsg));
    }
  },

  handleConversationDone: (sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    sendMessage(
      createQuestion(sender, 'Investigator guess.', [
        {
          text: 'Truth',
          payload: actions.createPayload(actions.SELECT_TRUTH, gameID),
          image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Green_check.svg/480px-Green_check.svg.png',
        },
        {
          text: 'False',
          payload: actions.createPayload(actions.SELECT_LIE, gameID),
          image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Red_X.svg/768px-Red_X.svg.png',
        },
      ])
    );
  },

  handleDefaultReply: (sender, payload) => {
    sendMessage(
      createTextMessage(sender, `Quick reply with payload ${payload}`)
    );
  },

  handleDefaultPostback: (sender, payload) => {
    sendMessage(
      createTextMessage(sender, `Postback called with payload ${payload}`)
    );
  },
};
