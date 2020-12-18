const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

/**
 * POST /events
 */
app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  console.log('RECEIVED_EVENT: ', type);

  if (type === 'COMMENT_CREATED') {
    const { id, content, postId } = data;

    const status = content.includes('orange') ? 'rejected' : 'approved';

    await axios.post('http://localhost:4005/events', {
      type: 'COMMENT_MODERATED',
      data: {
        id,
        content,
        status,
        postId,
      }
    });
  }

  res.status(200).send({});
});

app.listen(4003, () => {
  console.log('Listening on 4003');
});