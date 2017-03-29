const request = require('request');

const token = process.env.FB_PAGE_ACCESS_TOKEN;

const createRecipient = sender => ({
  id: sender
});

const sendMessage = (message) => {
  request(
    message,
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
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: {
      recipient: createRecipient(sender),
      message: messageData
    }
  };
};

exports.token = token;
exports.sendMessage = sendMessage;
exports.createTextMessage = createTextMessage;
