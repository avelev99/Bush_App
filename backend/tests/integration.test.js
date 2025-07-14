const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createApp = require('../app');
const { User, Location } = require('../src/models');
const fs = require('fs');
const path = require('path');

let mongod;
let app;
let token;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  process.env.JWT_SECRET = 'testsecret';
  fs.mkdirSync(path.join(__dirname, '..', 'uploads'), { recursive: true });
  app = createApp();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
  fs.rmSync(path.join(__dirname, '..', 'uploads'), { recursive: true, force: true });
});

afterEach(async () => {
  await User.deleteMany();
  await Location.deleteMany();
});

describe('Authentication flow', () => {
  test('successful registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test', email: 't@e.com', password: 'pass' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  test('duplicate registration fails', async () => {
    await new User({ username: 'test', email: 't@e.com', password: 'hash' }).save();
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test', email: 't@e.com', password: 'pass' });
    expect(res.statusCode).toBe(400);
  });

  test('login with valid credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'test', email: 't@e.com', password: 'pass' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 't@e.com', password: 'pass' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('login with invalid credentials fails', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'test', email: 't@e.com', password: 'pass' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 't@e.com', password: 'wrong' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Locations API', () => {
  let authToken;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'loc', email: 'loc@e.com', password: 'pass' });
    authToken = res.body.token;
  });

  test('listing locations when none exist', async () => {
    const res = await request(app)
      .get('/api/locations');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('creating and fetching a location', async () => {
    const createRes = await request(app)
      .post('/api/locations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ latitude: 1, longitude: 2, description: 'here' });
    expect(createRes.statusCode).toBe(200);
    expect(createRes.body).toHaveProperty('_id');
    const id = createRes.body._id;

    const listRes = await request(app).get('/api/locations');
    expect(listRes.body.length).toBe(1);

    const fetchRes = await request(app).get(`/api/locations/${id}`);
    expect(fetchRes.statusCode).toBe(200);
    expect(fetchRes.body._id).toBe(id);
  });

  test('posting a comment', async () => {
    const locRes = await request(app)
      .post('/api/locations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ latitude: 1, longitude: 2, description: 'here' });
    const id = locRes.body._id;

    const commentRes = await request(app)
      .post(`/api/locations/${id}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ text: 'Nice place' });
    expect(commentRes.statusCode).toBe(200);
    expect(commentRes.body[0].text).toBe('Nice place');
  });

  test('uploading images', async () => {
    const locRes = await request(app)
      .post('/api/locations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ latitude: 1, longitude: 2, description: 'here' });
    const id = locRes.body._id;

    const imgRes = await request(app)
      .post(`/api/locations/${id}/images`)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('images', Buffer.from('img'), 'test.jpg');
    expect(imgRes.statusCode).toBe(200);
    expect(imgRes.body.imageUrls.length).toBe(1);
  });
});
