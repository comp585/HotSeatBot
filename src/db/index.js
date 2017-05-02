const v4 = require('uuid/v4');
const firebase = require('firebase');

const config = {
  apiKey: process.env.DB_API_KEY,
  authDomain: process.env.DB_AUTH_DOMAIN,
  databaseURL: process.env.DB_URL,
  storageBucket: process.env.DB_BUCKET,
};

firebase.initializeApp(config);

const db = firebase.database();

const getPlayTo = playerCount => playerCount + 1;

const updateGame = (sender, id, game) =>
  db.ref(`users/${sender}/games/${id}`).set(game).then(() => id).catch(err => {
    throw new Error(`Write error: ${err}`);
  });

const newGame = sender => {
  const id = v4();
  const game = {
    round: 0,
    currCount: 0,
  };
  return updateGame(sender, id, game);
};

const set = (uri, field, value) => {
  const state = {};
  state[field] = value;
  return db.ref(uri).update(state).then(val => val).catch(err => {
    throw new Error(`Write error: ${err}`);
  });
};

const read = (uri, field) =>
  db
    .ref(uri)
    .once('value')
    .then(snapshot => snapshot.val()[field])
    .catch(err => {
      throw new Error(`Read error: ${err}`);
    });

const setGameState = (sender, id, field, val) =>
  set(`users/${sender}/games/${id}`, field, val);

const readGameState = (sender, id, field) =>
  read(`users/${sender}/games/${id}`, field);

const setAnswer = (sender, id, answer) =>
  setGameState(sender, id, 'answer', answer);

const getGame = (sender, id) =>
  db
    .ref(`users/${sender}/games/${id}`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => {
      throw new Error(`Read error: ${err}`);
    });

const getAnswer = (sender, id) => readGameState(sender, id, 'answer');

const addPlayer = (sender, id, name, emoji) => {
  const ref = db.ref(`users/${sender}/games/${id}/players`).push();
  return ref
    .set({
      name,
      score: 0,
      emoji,
    })
    .then(val => val)
    .catch(err => {
      throw new Error(`Write error: ${err}`);
    });
};

const endRound = (sender, id, answer) => {
  let shouldEnd = false;

  return getGame(sender, id)
    .then(game => {
      const currGame = game;
      const correct = answer === currGame.answer;
      const keys = Object.keys(currGame.players);
      const playerCount = keys.length;
      const tellerIndex = currGame.round % playerCount;
      currGame.round += 1;
      for (let i = 0; i < keys.length; i += 1) {
        if (i === tellerIndex) {
          currGame.players[keys[i]].score += correct ? 0 : 1;
        } else {
          currGame.players[keys[i]].score += correct ? 1 : 0;
        }

        if (currGame.players[keys[i]].score >= getPlayTo(playerCount)) {
          shouldEnd = true;
        }
      }

      return currGame;
    })
    .then(game => updateGame(sender, id, game))
    .then(() => shouldEnd);
};

const toArray = obj => Object.keys(obj).map(key => obj[key]);

const getPlayers = (sender, id) =>
  readGameState(sender, id, 'players').then(players => toArray(players));

const getWinners = (sender, id) =>
  getPlayers(sender, id).then(players =>
    players
      .filter(player => player.score >= getPlayTo(players.length))
      .map(player => player.emoji));

const getRound = (sender, id) => readGameState(sender, id, 'round');

const getPlayerCount = (sender, id) => readGameState(sender, id, 'count');

const setPlayerCount = (sender, id, count) =>
  setGameState(sender, id, 'count', count);

const getCount = (sender, id) => readGameState(sender, id, 'currCount');

const setCurrentCount = (sender, id, count) =>
  setGameState(sender, id, 'currCount', count);

const updateCount = (sender, id) =>
  getCount(sender, id)
    .then(count => setCurrentCount(sender, id, count + 1))
    .then(val => val);

module.exports = {
  newGame,
  setAnswer,
  setPlayerCount,
  getAnswer,
  getPlayers,
  getWinners,
  getRound,
  getCount,
  addPlayer,
  endRound,
  updateCount,
  getPlayerCount,
};
