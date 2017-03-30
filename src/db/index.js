const state = {};

const newGame = id => {
  state.id = {};
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
