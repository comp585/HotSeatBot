const request = require('request');

const token = process.env.FB_PAGE_ACCESS_TOKEN;

const createRecipient = sender => ({
  id: sender
});

const getApiHeader = () => ({
  url: 'https://graph.facebook.com/v2.6/me/messages',
  qs: { access_token: token }
});

const getPostHeader = () => ({
  method: 'POST'
});

const wrapRequest = req =>
  Object.assign(getApiHeader(), getPostHeader(), { json: req });

const sendMessage = (message) => {
  request(
    wrapRequest(message),
    (err, res) => {
      if (err) {
        console.log('Error sending messages: ', err);
      } else if (res.body.error) {
        console.log('Error: ', res.body.error);
      }
    }
  );
};

const createTextMessage = (sender, text) => {
  const messageData = { text };

  return {
    recipient: createRecipient(sender),
    message: messageData
  };
};

exports.token = token;
exports.sendMessage = sendMessage;
exports.createTextMessage = createTextMessage;
