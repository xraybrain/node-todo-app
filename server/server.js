var express = require('express');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text,
  });

  todo.save().then(
    (doc) => {
      res.send(doc);
    },
    (e) => {
      res.status(400).send(e);
    }
  );
});

app.get('/todos', async (req, res) => {
  try {
    let todos = await Todo.find({});
    res.send({ todos });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

app.listen(3000, () => {
  console.log(`Started on port 3000`);
});

module.exports = { app };
