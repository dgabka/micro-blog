const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const queryData = {};

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    queryData[data.id] = { ...data, comments: [] };
  } else if (type === 'CommentCreated') {
    queryData[data.postId].comments.push(data.comment);
  } else if (type === 'CommentUpdated') {
    const index = queryData[data.postId].comments.findIndex(
      ({ id }) => id === data.comment.id
    );
    queryData[data.postId].comments[index] = data.comment;
  }
};

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({ status: 'OK' });
});

app.get('/posts', (req, res) => {
  res.send(Object.values(queryData));
});

app.listen(4002, async () => {
  console.log('Listening on port 4002');

  try {
    const { data: events } = await axios.get(
      'http://event-bus-srv:4005/events'
    );
    events.map(({ type, data }) => handleEvent(type, data));
  } catch (e) {
    console.error(e);
  }
});
