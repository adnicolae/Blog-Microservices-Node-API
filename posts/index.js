const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Local repository for posts data
const posts = {};

/**
 * GET /posts
 */
app.get('/posts', (req, res) => {
  res.send(posts);
});

/**
 * POST /posts { title: 'example' }
 */
app.post('/posts', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title, body } = req.body;

  posts[id] = {
    id, title, body
  };

  await axios.post('http://localhost:4005/events', {
    type: 'POST_CREATED',
    data: {
      id,
      title
    }
  });

  res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  console.log('RECEIVED_EVENT: ', req.body.type);

  res.status(200).send({});
});

app.listen(4000, () => {
  console.log('Listening on port 4000');
});