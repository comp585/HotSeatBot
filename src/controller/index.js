const async = require('asyncawait/async');
const aw = require('asyncawait/await');

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
  handleStart: async((sender, topics) => {
    const id = aw(db.newGame(sender));
    const emojis = getEmojis(2);

    aw(db.addPlayer(sender, id, 'Player 1', emojis[0]));
    aw(db.addPlayer(sender, id, 'Player 2', emojis[1]));

    const round = aw(db.getRound(sender, id));
    const players = aw(db.getPlayers(sender, id));

    sendMessages([
      createRoundView(sender, round, players),
      createTextMessage(sender, 'Choose a topic'),
      createGeneric(sender, topics, id),
    ]);
  }),

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

  handleTopicSelect: async((sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    const topic = actions.getTopic(payload);
    const questions = getQuestions(topic);
    const question = api.getRandomQuestion(questions);

    const answer = Math.random() > 0.5;
    const msg = answer ? 'Tell the truth.' : 'Tell a lie';
    aw(db.setAnswer(sender, gameID, answer));

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
  }),

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

  handleChoiceSelection: async((sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    const answer = aw(db.getAnswer(sender, gameID));
    if (answer === undefined) {
      sendMessage(createTextMessage(sender, 'Sorry, game data not found'));
    } else {
      const res = payload.startsWith(actions.SELECT_TRUTH);
      const resMsg = res === answer
        ? 'Investigator wins this round!'
        : 'Teller wins this round!';
      const over = aw(db.endRound(sender, gameID, res)) > 0;
      if (over) {
        const winners = aw(db.getWinners(sender, gameID));
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
  }),

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

  handleContinue: async((sender, topics, payload) => {
    const id = actions.getPayloadId(payload);
    const round = aw(db.getRound(sender, id));
    const players = aw(db.getPlayers(sender, id));
    sendMessages([
      createRoundView(sender, round, players),
      createTextMessage(sender, 'Choose a topic'),
      createGeneric(sender, topics, id),
    ]);
  }),
};
