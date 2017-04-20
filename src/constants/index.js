const del = '_';

const GET_STARTED_PAYLOAD = 'GET_STARTED_PAYLOAD';
const CONFIRM_ANSWER = 'CONFIRM_ANSWER';
const SET_TRUTH = 'SET_TRUTH';
const SET_LIE = 'SET_LIE';
const SELECT_TRUTH = 'SELECT_TRUTH';
const SELECT_LIE = 'SELECT_LIE';
const TOPIC = 'TOPIC';
const DONE = 'DONE';
const CONTINUE_GAME = 'CONTINUE_GAME';
const NEW_GAME = 'NEW_GAME';
const COUNT = 'COUNT';
const PIECE = 'PIECE';
const READY = 'READY';

module.exports = {
  GET_STARTED_PAYLOAD,
  CONFIRM_ANSWER,
  SET_TRUTH,
  SET_LIE,
  SELECT_TRUTH,
  SELECT_LIE,
  DONE,
  CONTINUE_GAME,
  NEW_GAME,
  READY,

  createPayload: (label, id) => label + del + id,

  getPayloadId: payload => payload.split(del).slice(-1)[0],

  // assuming SELECT_TOPIC_ID format
  getTopic: payload => payload.split(del)[1],

  createTopicSelector: topic => TOPIC + del + topic,

  isConfirmAnswer: payload => payload.startsWith(CONFIRM_ANSWER),

  isGetStartedPayload: payload => payload.startsWith(GET_STARTED_PAYLOAD),

  isTopicSelection: payload => payload.startsWith(TOPIC),

  isContinueGame: payload => payload.startsWith(CONTINUE_GAME),

  isNewGamePayload: payload => payload.startsWith(NEW_GAME),

  createPlayerCountSelector: count => COUNT + del + count,

  isCountSelector: payload => payload.startsWith(COUNT),

  getPlayerCount: payload => payload.split(del)[1],

  createPieceSelector: piece => PIECE + del + piece,

  getPiece: payload => payload.split(del)[1],

  isPieceSelection: payload => payload.startsWith(PIECE),

  getSelector: payload => {
    const index = payload.lastIndexOf('_');
    return payload.slice(0, index);
  },
};
