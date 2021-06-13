const expect = require('expect');
const request = require('supertest');
const { app } = require('./../server');
const { Todo } = require('./../models/todo');

beforeEach((done) => {
  Todo.deleteMany({}).then(() => done());
});

describe('POST /todos', () => {
  it('should create new todo', async () => {
    let text = 'Test todo text';
    const response = await request(app).post('/todos').send({ text });
    expect(response.status).toBe(200);
    expect(response.body.text).toBe(text);
    Todo.find().then((todos) => {
      expect(todos.length).toBe(1);
      expect(todos[0].text).toBe(text);
    });
  });

  it('should not create todo with invalid body data', async () => {
    const response = await request(app).post('/todos').send();
    expect(response.status).toBe(400);
    Todo.find({}).then((docs) => {
      expect(docs.length).toBe(0);
    });
  });
});
