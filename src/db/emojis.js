const Combinatorics = require('js-combinatorics');

const emojis = {
  alien: '👾',
  cat: '🐱',
  dragon: '🐲',
  fish: '🐠',
  fox: '🦊',
  lion: '🦁',
  panda: '🐼',
  tiger: '🐯',
  turtle: '🐢',
  unicorn: '🦄',
  whale: '🐳',
};

module.exports = {
  emojis,
  getGamePieces: () => emojis,
  getRandomEmojis: count => {
    const cmb = Combinatorics.permutation(emojis).toArray();
    const el = cmb[Math.floor(Math.random() * cmb.length)];
    return el.slice(0, count);
  },
};
