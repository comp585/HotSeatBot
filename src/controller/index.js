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

const handleRoundStart = async((sender, payload, topics) => {
  const id = actions.getPayloadId(payload);
  const round = asyncAwait(db.getRound(sender, id));
  const players = asyncAwait(db.getPlayers(sender, id));
  const tellerIndex = round % players.length;
  const teller = players[tellerIndex].emoji;
  const investigators = players
    .filter((player, index) => index !== tellerIndex)
    .map(player => player.emoji);
  const messages = [
    createTextMessage(sender, `Welcome to round ${round + 1}!`),
    createTextMessage(sender, `${teller}, you're now on the hot seat!`),
    createRoundView(sender, round, players),
    createTopicReply(sender, teller, investigators, topics, id),
  ];

  // Provide round end information if this is the first round
  if (round === 0) {
    const infoMsg = `The first player to get ${players.length + 1} points wins!`;
    messages.splice(1, 0, createTextMessage(sender, infoMsg));
  }

  sendMessages(messages);
});

const createPieceSelection = (sender, id, currCount) =>
  createQuestion(
    sender,
    `Player ${currCount + 1}: Choose a game piece.`,
    Object.keys(emojis).map(emoji => ({
      text: emojis[emoji],
      payload: actions.createPayload(actions.createPieceSelector(emoji), id),
    }))
  );

module.exports = {
  handleGetStarted: async(sender => {
    const id = asyncAwait(db.newGame(sender));

    sendMessages([
      createTextMessage(
        sender,
        "I'm going to ask you and anyone you're with a few questions...😜"
      ),
      createTextMessage(
        sender,
        "Take turns on the Hot Seat, where you'll be told to either tell the truth 😅 or lie 🤥"
      ),
      createTextMessage(
        sender,
        'After you answer a question, everyone else has to decide whether they believe you!'
      ),
      createQuestion(sender, 'Ready for a good time?', [
        {
          text: "Let's go!",
          payload: actions.createPayload(actions.GO, id),
        },
      ]),
    ]);
  }),

  handleNewStart: (sender, payload) => {
    const id = actions.getPayloadId(payload);

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
  },

  handleReStart: async(sender => {
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
    switch (text) {
      case 'New Game':
        module.exports.handleGetStarted(sender);
        break;
      case 'Restart Bot':
        module.exports.handleReStart(sender);
        break;
      default:
        sendMessage(
          createTextMessage(sender, `You sent: ${text.substring(0, 200)}`)
        );
    }
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
      handleRoundStart(sender, payload, getTopics());
    }
  }),

  handleTopicSelect: async((sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    const topic = actions.getTopic(payload);
    const questions = getQuestions(topic);
    const question = api.getRandomQuestion(questions);

    const round = asyncAwait(db.getRound(sender, gameID));
    const players = asyncAwait(db.getPlayers(sender, gameID));
    const teller = api.getTeller(round, players);

    sendMessages([
      createTextMessage(sender, `Question: ${question}`),
      createQuestion(
        sender,
        `${teller}, get ready to receive your secret directions`,
        [
          {
            text: 'Ready',
            payload: actions.createPayload(actions.READY, gameID),
            image_url: createImageUrl('checkBlue.png'),
          },
        ]
      ),
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
          image_url: createImageUrl('zipper-mouth-face.png'),
        },
        {
          text: msg,
          payload: actions.createPayload(actions.CONFIRM_ANSWER, gameID),
        },
      ])
    );
  }),

  handleChoiceSet: async((sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    const round = asyncAwait(db.getRound(sender, gameID));
    const players = asyncAwait(db.getPlayers(sender, gameID));
    const teller = api.getTeller(round, players);

    sendMessage(
      createQuestion(sender, `${teller} answer the question.`, [
        {
          text: 'Done',
          payload: actions.createPayload(actions.DONE, gameID),
          image_url: createImageUrl('checkBlue.png'),
        },
      ])
    );
  }),

  handleChoiceSelection: async((sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    const answer = asyncAwait(db.getAnswer(sender, gameID));
    const round = asyncAwait(db.getRound(sender, gameID));
    const players = asyncAwait(db.getPlayers(sender, gameID));
    const teller = api.getTeller(round, players);
    const investigators = api.getInvestigators(round, players);
    const winnerText = investigators.length > 1 ? 'win' : 'wins';
    const investigatorText = investigators.join(', ');

    if (answer === undefined) {
      sendMessage(createTextMessage(sender, 'Sorry, game data not found'));
    } else {
      const res = payload.startsWith(actions.SELECT_TRUTH);
      const resMsg = res === answer
        ? `${investigatorText} ${winnerText} this round!`
        : `${teller} wins this round!`;
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

  handleConversationDone: async((sender, payload) => {
    const gameID = actions.getPayloadId(payload);
    const round = asyncAwait(db.getRound(sender, gameID));
    const players = asyncAwait(db.getPlayers(sender, gameID));
    const teller = api.getTeller(round, players);
    const investigators = api.getInvestigators(round, players).join(', ');

    sendMessage(
      createQuestion(
        sender,
        `${investigators}, is ${teller} lying or telling the truth?`,
        [
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
        ]
      )
    );
  }),

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
    handleRoundStart(sender, payload, topics);
  }),
};
