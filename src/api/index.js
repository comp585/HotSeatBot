const request = require('request');

const token = process.env.FB_PAGE_ACCESS_TOKEN;

const createRecipient = sender => ({
  id: sender,
});

const getApiHeader = () => ({
  url: 'https://graph.facebook.com/v2.6/me/messages',
  qs: { access_token: token },
});

const getPostHeader = () => ({
  method: 'POST',
});

const wrapRequest = req =>
  Object.assign(getApiHeader(), getPostHeader(), { json: req });

const wrapGenericMsg = (sender, req) =>
  Object.assign({ recipient: createRecipient(sender) }, { message: req });

const wrapTemplate = (sender, req) =>
  wrapGenericMsg(sender, { attachment: { type: 'template', payload: req } });

const sendMessage = message => {
  request(wrapRequest(message), (err, res) => {
    if (err) {
      console.log('Error sending messages: ', err);
    } else if (res.body.error) {
      console.log('Error: ', res.body.error);
    }
  });
};

const createTextMessage = (sender, text) => {
  const messageData = { text };

  return wrapGenericMsg(sender, messageData);
};

const createPostbackButton = button => ({
  type: 'postback',
  title: button.title,
  payload: button.payload,
});

const createPostback = (sender, title, buttons) =>
  wrapTemplate(sender, {
    template_type: 'button',
    text: title,
    buttons: buttons.map(createPostbackButton),
  });

exports.token = token;
exports.sendMessage = sendMessage;
exports.createTextMessage = createTextMessage;
exports.createPostback = createPostback;
