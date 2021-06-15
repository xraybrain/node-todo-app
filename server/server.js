var express = require('express');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
const { ObjectID } = require('mongodb');

var app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text,
  });

  todo.save().then(
    (todo) => {
      res.send({ todo });
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

app.get('/todos/:id', (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then(
    (todo) => {
      if (!todo) return res.status(404).send();

      res.send({ todo });
    },
    (e) => {
      res.status(400).send();
    }
  );
});

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) return res.status(404).send();

  Todo.findByIdAndDelete(id).then(
    (todo) => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    },
    (err) => {
      res.status(400).send();
    }
  );
});

app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`);
});

module.exports = { app };
