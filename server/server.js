require('./config/config');
const _ = require('lodash');
const express = require('express');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { ObjectID } = require('mongodb');
const { authenticate } = require('./middleware/authenticate');

var app = express();
const PORT = process.env.PORT;

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

  Todo.findByIdAndDelete(id, { useFindAndModify: false }).then(
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

app.patch('/todos/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) return res.status(404).send();

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, useFindAndModify: false }
  )
    .then((todo) => {
      if (!todo) return res.status(404).send();
      res.send({ todo });
    })
    .catch((e) => {
      res.status(400).send();
    });
});

app.post('/users/', async (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let newUser = new User(body);

  try {
    let user = await newUser.save();
    if (!user) res.status(404).send();
    let token = await user.generateAuthToken();
    res.header('x-auth', token).send({ user });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/users/me', authenticate, async (req, res) => {
  res.send(req.user);
});

app.post('/users/login', async (req, res) => {
  try {
    let body = _.pick(req.body, ['email', 'password']);
    let user = await User.findByCredentials(body.email, body.password);
    let token = await user.generateAuthToken();

    res.header('x-auth', token).send(user);
  } catch (error) {
    res.status(400).send();
  }
});

app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (error) {
    res.status(400).send();
  }
});

app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`);
});

module.exports = { app };
