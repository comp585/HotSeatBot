const v4 = require('uuid/v4');

const state = {};

const newGame = () => {
  const id = v4();
  state[id] = {};

  return id;
};

const setAnswer = (id, answer) => {
  state.id.answer = answer;
};

const getAnswer = id => state.id.answer;

module.exports = {
  newGame,
  setAnswer,
  getAnswer,
};
