const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { randomBytes } = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.post('/posts/create', (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;

  posts[id] = {
    id,
    title,
  };

  console.log('created post', posts[id]);

  axios.post('http://event-bus-srv:4005/events', {
    type: 'PostCreated',
    data: posts[id],
  });

  res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  console.log('Received Event: ', req.body);
  res.sendStatus(200);
});

app.listen(4000, () => {
  console.log('Listening on port 4000');
});
