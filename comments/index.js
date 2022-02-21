const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { randomBytes } = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];
  const comment = { id, content, status: 'pending' };
  comments.push(comment);
  commentsByPostId[req.params.id] = comments;

  console.log('created comment for post:', req.params.id, comment);

  axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      postId: req.params.id,
      comment,
    },
  });

  res.status(201).send(comments);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const commentIndex = commentsByPostId[data.postId].findIndex(
      ({ id }) => id === data.comment.id
    );
    commentsByPostId[data.postId][commentIndex] = data.comment;
    axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data,
    });
  }
  res.sendStatus(200);
});

app.listen(4001, () => {
  console.log('Listening on port 4001');
});
