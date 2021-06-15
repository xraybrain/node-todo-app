const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [
  { _id: new ObjectID(), text: 'First test todo' },
  { _id: new ObjectID(), text: 'Second test todo' },
];

beforeEach((done) => {
  Todo.deleteMany({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(done());
});

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
