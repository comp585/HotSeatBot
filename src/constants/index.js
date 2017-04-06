const del = '_';

const GET_STARTED_PAYLOAD = 'GET_STARTED_PAYLOAD';
const SET_TRUTH = 'SET_TRUTH';
const SET_LIE = 'SET_LIE';
const SELECT_TRUTH = 'SELECT_TRUTH';
const SELECT_LIE = 'SELECT_LIE';
const TOPIC = 'TOPIC';
const DONE = 'DONE';

module.exports = {
  GET_STARTED_PAYLOAD,
  SET_TRUTH,
  SET_LIE,
  SELECT_TRUTH,
  SELECT_LIE,
  DONE,

  createPayload: (label, id) => label + del + id,

  getPayloadId: payload => payload.split(del).slice(-1)[0],

  // assuming SELECT_TOPIC_ID format
  getTopic: payload => payload.split(del)[1],

  createTopicSelector: topic => TOPIC + del + topic,

  isGetStartedPayload: payload => payload.startsWith(GET_STARTED_PAYLOAD),

  isTopicSelection: payload => payload.startsWith(TOPIC),

  getSelector: payload => {
    const index = payload.lastIndexOf('_');
    return payload.slice(0, index);
  },
};
