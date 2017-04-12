const appUrl = 'https://hot-seat.herokuapp.com/';
const imgDir = 'img';

module.exports = {
  createImageUrl: image => `${appUrl}/${imgDir}/${image}`,
};
