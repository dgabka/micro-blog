const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const sleep = (time = 5000) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'CommentCreated') {
    if (data.comment.content.toLowerCase().includes('orange')) {
      data.comment.status = 'rejected';
    } else {
      data.comment.status = 'approved';
    }

    await sleep();

    axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentModerated',
      data,
    });
  }
  res.sendStatus(200);
});

app.listen(4003, () => {
  console.log('Listening on port 4003');
});
