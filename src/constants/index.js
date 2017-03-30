const del = '_';

const SET_TRUTH = 'SET_TRUTH';
const SET_LIE = 'SET_LIE';
const SELECT_TRUTH = 'SELECT_TRUTH';
const SELECT_LIE = 'SELECT_LIE';
const TOPIC = 'TOPIC';

module.exports = {
  SET_TRUTH,
  SET_LIE,
  SELECT_TRUTH,
  SELECT_LIE,

  createPayload: (label, id) => label + del + id,

  getPayloadId: payload => payload.split(del).slice(-1)[0],

  // assuming SELECT_TOPIC_ID format
  getTopic: payload => payload.split(del)[1],

  createTopicSelector: topic => TOPIC + del + topic,

  isTopicSelection: payload => payload.startsWith(TOPIC),
};
