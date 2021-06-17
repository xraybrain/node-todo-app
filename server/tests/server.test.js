const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { populateTodos, todos, populateUsers, users } = require('./seed/seed');
const { User } = require('../models/user');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create new todo', async () => {
    let text = 'Test todo text';
    const response = await request(app).post('/todos').send({ text });
    expect(response.status).toBe(200);
    expect(response.body.todo.text).toBe(text);
    Todo.find({ text }).then((todos) => {
      expect(todos.length).toBe(1);
      expect(todos[0].text).toBe(text);
    });
  });

  it('should not create todo with invalid body data', async () => {
    const response = await request(app).post('/todos').send({});
    expect(response.status).toBe(400);
    Todo.find({}).then((docs) => {
      expect(docs.length).toBe(2);
    });
  });
});

describe('GET /todos', () => {
  it('should get all todos', async () => {
    const response = await request(app).get('/todos');
    expect(response.status).toBe(200);
    expect(response.body.todos.length).toBe(2);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', async () => {
    const response = await request(app).get(
      `/todos/${todos[0]._id.toHexString()}`
    );

    expect(response.status).toBe(200);
    expect(response.body.todo.text).toBe(todos[0].text);
  });

  it('should return 404 if todo not found', async () => {
    let id = new ObjectID().toHexString();
    const response = await request(app).get(`/todos/${id}`);

    expect(response.status).toBe(404);
  });

  it('should return 404 for non-object ids', async () => {
    const response = await request(app).get(`/todos/1234`);

    expect(response.status).toBe(404);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', async () => {
    let hexId = todos[1]._id.toHexString();
    const response = await request(app).delete(`/todos/${hexId}`);

    expect(response.status).toBe(200);
    expect(response.body.todo._id).toBe(hexId);

    Todo.findById(hexId).then((todo) => {
      return expect(todo).toBeNull();
    });
  });

  it('should return 404 if todo not found', async () => {
    let hexId = new ObjectID().toHexString();
    const response = await request(app).delete(`/todos/${hexId}`);

    expect(response.status).toBe(404);
  });

  it('should return 404 if object id is invalid', async () => {
    const response = await request(app).get(`/todos/1234`);

    expect(response.status).toBe(404);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', async () => {
    let hexId = todos[0]._id.toHexString();
    const patch = { text: 'cool off', completed: true };
    const response = await request(app).patch(`/todos/${hexId}`).send(patch);

    expect(response.status).toBe(200);
    expect(response.body.todo.text).toBe(patch.text);
    expect(response.body.todo.completed).toBe(true);
    expect(response.body.todo.completedAt).not.toBeNull();
  });

  it('should clear completedAt when todo is not completed', async () => {
    let hexId = todos[1]._id.toHexString();
    const patch = { text: 'be calm', completed: false };
    const response = await request(app).patch(`/todos/${hexId}`).send(patch);

    expect(response.status).toBe(200);
    expect(response.body.todo.text).toBe(patch.text);
    expect(response.body.todo.completed).toBe(false);
    expect(response.body.todo.completedAt).toBeNull();
  });
});

describe('GET /users/me', () => {
  it('should return a user if authenticated', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(users[0]._id.toHexString());
    expect(response.body.email).toBe(users[0].email);
  });
  it('should return 401 if not authenticated', async () => {
    const response = await request(app).get('/users/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({});
  });
});

describe('POST /users/', () => {
  it('should create a user', async () => {
    var email = 'example@example.com';
    var password = '123mnb!';
    const response = await request(app)
      .post('/users/')
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.headers['x-auth']).toBeDefined();
    expect(response.body.user._id).toBeDefined();
    expect(response.body.user.email).toBeDefined();

    let user = await User.findOne({ email });
    expect(user).toBeDefined();
    expect(user.password).not.toBe(password);
  });
  it('should return validation errors if request invalid', async () => {
    var email = 'bademail.com';
    var password = '123';
    const response = await request(app)
      .post('/users/')
      .send({ email, password });

    expect(response.status).toBe(400);
  });
  it('should not create user if email in use', async () => {
    var email = users[0].email;
    var password = '123good';
    const response = await request(app)
      .post('/users/')
      .send({ email, password });

    expect(response.status).toBe(400);
  });
});
