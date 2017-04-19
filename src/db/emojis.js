const Combinatorics = require('js-combinatorics');

const emojis = {
  alien: '👾',
  lion: '🦁',
  tiger: '🐯',
  turtle: '🐢',
  fish: '🐠',
  fox: '🦊',
  cat: '🐱',
  unicorn: '🦄',
};

module.exports = {
  emojis,
  getRandomEmojis: count => {
    const cmb = Combinatorics.permutation(emojis).toArray();
    const el = cmb[Math.floor(Math.random() * cmb.length)];
    return el.slice(0, count);
  },
};
