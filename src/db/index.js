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

const playTo = 3;

const updateGame = (sender, id, game) =>
  db.ref(`users/${sender}/games/${id}`).set(game).then(() => id).catch(err => {
    throw new Error(`Write error: ${err}`);
  });

const newGame = sender => {
  const id = v4();
  const game = {
    round: 0,
  };
  return updateGame(sender, id, game);
};

const setAnswer = (sender, id, answer) =>
  db
    .ref(`users/${sender}/games/${id}`)
    .update({ answer })
    .then(val => val)
    .catch(err => {
      throw new Error(`Write error: ${err}`);
    });

const getGame = (sender, id) =>
  db
    .ref(`users/${sender}/games/${id}`)
    .once('value')
    .then(snapshot => snapshot.val())
    .catch(err => {
      throw new Error(`Read error: ${err}`);
    });

const getAnswer = (sender, id) =>
  db
    .ref(`users/${sender}/games/${id}`)
    .once('value')
    .then(snapshot => snapshot.val().answer)
    .catch(err => {
      throw new Error(`Read error: ${err}`);
    });

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
      const tellerIndex = currGame.round % Object.keys(currGame.players).length;
      currGame.round += 1;
      for (let i = 0; i < keys.length; i += 1) {
        if (i === tellerIndex) {
          currGame.players[keys[i]].score += correct ? 0 : 1;
        } else {
          currGame.players[keys[i]].score += correct ? 1 : 0;
        }

        if (currGame.players[keys[i]].score >= playTo) {
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
  db
    .ref(`users/${sender}/games/${id}`)
    .orderByKey()
    .once('value')
    .then(snapshot => toArray(snapshot.val().players))
    .catch(err => {
      throw new Error(`Read error: ${err}`);
    });

const getWinners = (sender, id) =>
  getPlayers(sender, id).then(players =>
    players
      .filter(player => player.score >= playTo)
      .map(player => player.emoji));

const getRound = (sender, id) =>
  db
    .ref(`users/${sender}/games/${id}`)
    .once('value')
    .then(snapshot => snapshot.val().round)
    .catch(err => {
      throw new Error(`Read error: ${err}`);
    });

module.exports = {
  newGame,
  setAnswer,
  getAnswer,
  getPlayers,
  getWinners,
  getRound,
  addPlayer,
  endRound,
};
