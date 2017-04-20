const async = require('asyncawait/async');
const asyncAwait = require('asyncawait/await');
const dedent = require('dedent-js');

const actions = require('../constants');
const api = require('../api');
const db = require('../db');
const getQuestions = require('../db/topics').getQuestions;
const emojis = require('../db/emojis').emojis;
const createImageUrl = require('../utils').createImageUrl;
const getTopics = require('../db/topics').getTopics;

const sendMessage = api.sendMessage;
const sendMessages = api.sendMessages;
const createTextMessage = api.createTextMessage;
const createQuestion = api.createQuestion;
const createRoundView = api.createRoundView;

const createTopicReply = (sender, teller, investigators, topics, id) =>
  createQuestion(
    sender,
    dedent`${investigators.join(', ')}, choose a topic you want to learn more about ${teller}.`,
    topics.map(topic => ({
      text: topic.category,
      payload: actions.createPayload(
        actions.createTopicSelector(topic.category),
        id
      ),
      image_url: topic.url,
    }))
  );

const handleGameStart = async((sender, payload, topics) => {
  const id = actions.getPayloadId(payload);
  const round = asyncAwait(db.getRound(sender, id));
  const players = asyncAwait(db.getPlayers(sender, id));
  const tellerIndex = round % players.length;
  const teller = players[tellerIndex].emoji;
  const investigators = players
    .filter((player, index) => index !== tellerIndex)
    .map(player => player.emoji);
  sendMessages([
    createRoundView(sender, round, players),
    createTopicReply(sender, teller, investigators, topics, id),
  ]);
});

const createPieceSelection = (sender, id, currCount) =>
  createQuestion(
    sender,
    `Player ${currCount}: Choose a game piece.`,
    Object.keys(emojis).map(emoji => ({
      text: emojis[emoji],
      payload: actions.createPayload(actions.createPieceSelector(emoji), id),
    }))
  );

module.exports = {
  handleStart: async(sender => {
    const id = asyncAwait(db.newGame(sender));

    sendMessage(
      createQuestion(
        sender,
        'How many players?',
        [2, 3, 4, 5].map(count => ({
          text: count,
          payload: actions.createPayload(
            actions.createPlayerCountSelector(count),
            id
          ),
        }))
      )
    );
  }),

  handleDefaultMessage: (sender, text) => {
    sendMessage(
      createTextMessage(
        sender,
        `Text received, echo: ${text.substring(0, 200)}`
      )
    );
  },

  handlePlayerCountSet: async((sender, payload) => {
    const id = actions.getPayloadId(payload);
    const playerCount = actions.getPlayerCount(payload);
    const currCount = 0;
    asyncAwait(db.setPlayerCount(sender, id, playerCount));

    sendMessage(createPieceSelection(sender, id, currCount));
  }),

  handleAddPlayer: async((sender, payload) => {
    const id = actions.getPayloadId(payload);
    const piece = actions.getPiece(payload);
    const playerCount = asyncAwait(db.getPlayerCount(sender, id));
    const currCount = asyncAwait(db.getCount(sender, id)) + 1;

    asyncAwait(db.addPlayer(sender, id, `Player ${currCount}`, emojis[piece]));
    asyncAwait(db.updateCount(sender, id));

    if (currCount < playerCount) {
      sendMessage(createPieceSelection(sender, id, currCount));
    } else {
      handleGameStart(sender, payload, getTopics());
    }
  }),

  handleTopicSelect: async((sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    const topic = actions.getTopic(payload);
    const questions = getQuestions(topic);
    const question = api.getRandomQuestion(questions);

    sendMessages([
      createTextMessage(sender, `Question: ${question}`),
      createQuestion(sender, 'Teller, get ready to receive your secret directions', [
        {
          text: 'Ready',
          payload: actions.createPayload(actions.READY, gameID),
          image_url: createImageUrl('checkBlue.png'),
        }
      ])
    ]);
  }),
  handleTellerDirections: async((sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    const answer = Math.random() > 0.5;
    const msg = answer ? 'Tell the truth.' : 'Tell a lie';
    asyncAwait(db.setAnswer(sender, gameID, answer));

    sendMessage(
      createQuestion(sender, 'Press Hide to continue!', [
        {
          text: 'Hide',
          payload: actions.createPayload(actions.CONFIRM_ANSWER, gameID),
          image_url: createImageUrl('zipper-mouth-face.png')
        },
        {
          text: msg,
          payload: actions.createPayload(actions.CONFIRM_ANSWER, gameID),
        }
      ]),
    );
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
    const answer = asyncAwait(db.getAnswer(sender, gameID));
    if (answer === undefined) {
      sendMessage(createTextMessage(sender, 'Sorry, game data not found'));
    } else {
      const res = payload.startsWith(actions.SELECT_TRUTH);
      const resMsg = res === answer
        ? 'Investigator wins this round!'
        : 'Teller wins this round!';
      const over = asyncAwait(db.endRound(sender, gameID, res)) > 0;
      if (over) {
        const winners = asyncAwait(db.getWinners(sender, gameID));
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
    const round = asyncAwait(db.getRound(sender, id));
    const players = asyncAwait(db.getPlayers(sender, id));
    const tellerIndex = round % players.length;
    const teller = players[tellerIndex].emoji;
    const investigators = players
      .filter((player, index) => index !== tellerIndex)
      .map(player => player.emoji);
    sendMessages([
      createRoundView(sender, round, players),
      createTopicReply(sender, teller, investigators, topics, id),
    ]);
  }),
};
