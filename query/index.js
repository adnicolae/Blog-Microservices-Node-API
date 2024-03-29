const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
  if (type === 'POST_CREATED') {
    const { id, title, body } = data;

    posts[id] = { id, title, body, comments: [] };
  }

  if (type === 'COMMENT_CREATED') {
    const { id, content, status, postId } = data;

    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === 'COMMENT_UPDATED') {
    const { id, status, postId } = data;

    const post = posts[postId];
    const comment = post.comments.find(comment => comment.id === id);
    comment.status = status;
  }
}

/**
 * GET /posts
 */
app.get('/posts', (req, res) => {
  res.status(200).send(posts);
});

/**
 * POST /events
 */
app.post('/events', (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.status(200).send({});
});

app.listen(4002, async () => {
  console.log('Listening on port 4002');

  const res = await axios.get('http://localhost:4005/events');
  res.data.forEach(ev => {
    console.log(`Processing event: ${ ev.type }`);
    handleEvent(ev.type, ev.data);
  })
});