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

const endRound = (id, answer) => {
  if (!state[id]) {
    return undefined;
  }

  const correct = answer === state[id].answer;
  const tellerIndex = state[id].round % state[id].players.length;

  state[id].round += 1;

  for (let i = 0; i < state[id].players.length; i += 1) {
    if (i === tellerIndex) {
      state[id].players[i] += correct ? 0 : 1;
    } else {
      state[id].players[i] += correct ? 1 : 0;
    }
  }

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
