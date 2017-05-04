const appUrl = 'https://hot-seat.herokuapp.com/';
const imgDir = 'img';

const createImageUrl = image => `${appUrl}/${imgDir}/${image}`;

module.exports = {
  createImageUrl,
  getTellerIndex: (round, playerCount) => round % playerCount,
  getHideGif: round => {
    const gifCount = 7;
    const next = round % gifCount;
    return createImageUrl(`hush${next}.gif`);
  },
  getInvestigateGif: round => {
    const gifCount = 5;
    const next = round % gifCount;
    return createImageUrl(`investigate${next}.gif`);
  },
};
