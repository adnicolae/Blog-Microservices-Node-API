const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

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

  console.log(posts);

  res.status(200).send({});
});

app.listen(4002, () => {
  console.log('Listening on port 4002');
});