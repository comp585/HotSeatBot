const appUrl = 'https://hot-seat.herokuapp.com/';
const imgDir = 'img';

module.exports = {
  createImageUrl: image => `${appUrl}/${imgDir}/${image}`,
  getTellerIndex: (round, playerCount) => round % playerCount,
};
