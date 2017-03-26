const request = require('request');

export const token = process.env.FB_PAGE_ACCESS_TOKEN;

// sends text to the sender
export const sendTextMessage = (sender, text) => {
  const messageData = { text };
  request(
    {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: token },
      method: 'POST',
      json: {
        recipient: { id: sender },
        message: messageData,
      },
    },
    (error, response) => {
      if (error) {
        console.log('Error sending messages: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    },
  );
};
