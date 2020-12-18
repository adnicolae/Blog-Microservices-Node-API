const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Local repository for comments by post data
const commentsByPostId = {};

/**
 * GET /posts/:id/comments
 */
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

/**
 * POST /posts/:id/comments { title: 'example' }
 */
app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: 'pending' });

  commentsByPostId[req.params.id] = comments;

  await axios.post('http://localhost:4005/events', {
    type: 'COMMENT_CREATED',
    data: {
      id: commentId,
      content,
      status: 'pending',
      postId: req.params.id,
    }
  });

  res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  console.log('RECEIVED_EVENT: ', type);

  if (type === 'COMMENT_MODERATED') {
    const { postId, content, id, status } = data;

    const comments = commentsByPostId[postId];

    const comment = comments.find(comment => comment.id === id);
    comment.status = status;

    await axios.post('http://localhost:4005/events', {
      type: 'COMMENT_UPDATED',
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

app.listen(4001, () => {
  console.log('Listening on port 4001');
});