const actions = require('../constants');
const api = require('../api');
const db = require('../db');
const getQuestions = require('../db/topics').getQuestions;
const getEmojis = require('../db/emojis').getRandomEmojis;
const createImageUrl = require('../utils').createImageUrl;

const sendMessage = api.sendMessage;
const sendMessages = api.sendMessages;
const createTextMessage = api.createTextMessage;
const createGenericView = api.createGenericView;
const createGeneric = api.createGeneric;
const createQuestion = api.createQuestion;
const createElementView = api.createElementView;
const createPostbackButton = api.createPostbackButton;
const createRoundView = api.createRoundView;

module.exports = {
  handleStart: (sender, topics) => {
    const id = db.newGame();
    const emojis = getEmojis(2);

    db.addPlayer(id, emojis[0]);
    db.addPlayer(id, emojis[1]);

    sendMessages([
      createRoundView(sender, db.getRound(id), db.getPlayers(id)),
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

  handleAddPlayer: (sender, payload) => {
    sendMessage(
      createTextMessage(
        sender,
        `Add player is not yet supported with payload: ${payload}`
      )
    );
  },

  handleTopicSelect: (sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    const topic = actions.getTopic(payload);
    const questions = getQuestions(topic);
    const question = api.getRandomQuestion(questions);

    const answer = Math.random() > 0.5;
    const msg = answer ? 'Tell the truth.' : 'Tell a lie';
    db.setAnswer(gameID, answer);

    sendMessages([
      createTextMessage(sender, `Question: ${question}`),
      createGenericView(sender, [
        createElementView(
          'Directions',
          'Teller: Swipe right to reveal answer.',
          [
            createPostbackButton({
              title: 'Done',
              payload: actions.createPayload(actions.CONFIRM_ANSWER, gameID),
            }),
          ]
        ),
        createElementView('Answer', msg),
      ]),
    ]);
  },

  handleChoiceSet: (sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    sendMessage(
      createQuestion(sender, 'Teller answer the question.', [
        {
          text: 'Done',
          payload: actions.createPayload(actions.DONE, gameID),
          image_url: createImageUrl('checkBlue.png'),
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
      const over = db.endRound(gameID, res) > 0;
      if (over) {
        const winners = db.getWinners(gameID);
        sendMessages([
          createTextMessage(
            sender,
            `Game Over: ${winners.join(', ')} win${winners.length > 1 ? '' : 's'}!`
          ),
          createQuestion(sender, 'Press New Game to play again!', [
            {
              text: 'New Game',
              payload: actions.createPayload(actions.NEW_GAME, gameID),
            },
          ]),
        ]);
      } else {
        sendMessages([
          createTextMessage(sender, resMsg),
          createQuestion(sender, 'Press to move to the next round.', [
            {
              text: 'Continue',
              payload: actions.createPayload(actions.CONTINUE_GAME, gameID),
            },
          ]),
        ]);
      }
    }
  },

  handleConversationDone: (sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    sendMessage(
      createQuestion(sender, 'Investigator guess.', [
        {
          text: 'Truth',
          payload: actions.createPayload(actions.SELECT_TRUTH, gameID),
          image_url: createImageUrl('check.png'),
        },
        {
          text: 'False',
          payload: actions.createPayload(actions.SELECT_LIE, gameID),
          image_url: createImageUrl('x.png'),
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

  handleContinue: (sender, topics, payload) => {
    const id = actions.getPayloadId(payload);
    sendMessages([
      createRoundView(sender, db.getRound(id), db.getPlayers(id)),
      createTextMessage(sender, 'Choose a topic'),
      createGeneric(sender, topics, id),
    ]);
  },
};
