const appUrl = 'https://hot-seat.herokuapp.com/';
const imgDir = 'img';

const createImageUrl = image => `${appUrl}/${imgDir}/${image}`;
const gifCounts = {
  secret: 7,
  truth: 6,
  lie: 6,
  investigate: 6,
};

module.exports = {
  createImageUrl,
  getTellerIndex: (round, playerCount) => round % playerCount,
  getHideGif: round => {
    const next = round % gifCounts.secret;
    return createImageUrl(`secret/${next}.gif`);
  },
  getInvestigateGif: round => {
    const next = round % gifCounts.investigate;
    return createImageUrl(`investigate/${next}.gif`);
  },
  getTruthGif: round => {
    const next = round % gifCounts.truth;
    return createImageUrl(`truth/${next}.gif`);
  },
  getLieGif: round => {
    const next = round % gifCounts.lie;
    return createImageUrl(`lie/${next}.gif`);
  },
};
