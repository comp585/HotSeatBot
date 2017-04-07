const v4 = require('uuid/v4');

const playTo = 3;
const state = {};

const newGame = () => {
  const id = v4();
  state[id] = {
    round: 0,
    players: [],
  };

  return id;
};

const setAnswer = (id, answer) => {
  if (state[id]) {
    state[id].answer = answer;
  }
};

const getAnswer = id => {
  if (!state[id]) {
    return undefined;
  }
  return state[id].answer;
};

const addPlayer = (id, name) => {
  if (state[id]) {
    state[id].players.push({
      name,
      score: 0,
    });
  }
};

const endRound = id => {
  if (!state[id]) {
    return undefined;
  }

  state[id].round += 1;
  return state[id].players.filter(player => player.score >= playTo).length > 0;
};

const getPlayers = id => {
  if (!state[id]) {
    return undefined;
  }
  return state[id].players;
};

const getRound = id => {
  if (!state[id]) {
    return undefined;
  }

  return state[id].round;
};

module.exports = {
  newGame,
  setAnswer,
  getAnswer,
  getPlayers,
  getRound,
  addPlayer,
  endRound,
};
