const Combinatorics = require('js-combinatorics');

const emojis = ['👾', '🦁', '🐯', '🐢', '🐠', '🦊', '🐱', '🦄'];

module.exports = {
  getRandomEmojis: count => {
    const cmb = Combinatorics.permutation(emojis).toArray();
    const el = cmb[Math.floor(Math.random() * cmb.length)];
    return el.slice(0, count);
  },
};
