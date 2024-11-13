const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Create mock collection with all required methods
const mockCollection = {
  findOne: jest.fn(),
  find: jest.fn(),
  insertOne: jest.fn(),
  deleteOne: jest.fn(),
  replaceOne: jest.fn()
};

// Create mock database
const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection)
};

// Mock the entire database connection module
jest.mock('../db/conn', () => {
  return jest.fn().mockResolvedValue(mockDb);
});

// Import router after mocking database connection
const router = require('../routes/questions');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/', router);

describe('Question Routes', () => {
  const validToken = 'valid-token';

  beforeAll(() => {
    // Set JWT_SECRET for testing
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset all mock implementations
    mockCollection.findOne.mockReset();
    mockCollection.find.mockReset();
    mockCollection.insertOne.mockReset();
    mockCollection.deleteOne.mockReset();
    mockCollection.replaceOne.mockReset();

    // Mock JWT verify
    jwt.verify = jest.fn().mockImplementation((token) => {
      if (token === validToken) return true;
      throw new Error('Invalid token');
    });
  });

  describe('GET /question', () => {
    const mockQuestion = {
      'Question ID': 1,
      'Question Title': 'Test Question',
      '_id': 'mock-id'
    };

    test('should return question when valid ID and token provided', async () => {
      mockCollection.findOne.mockResolvedValueOnce(mockQuestion);

      const response = await request(app)
          .get('/question?questionId=1')
          .set('Cookie', [`accessToken=${validToken}`]);

      expect(response.status).toBe(200);
      const returnedQuestion = { ...mockQuestion };
      delete returnedQuestion._id;
      expect(response.body).toEqual(returnedQuestion);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ 'Question ID': 1 });
    });

    test('should return 401 when invalid token provided', async () => {
      const response = await request(app)
          .get('/question?questionId=1')
          .set('Cookie', ['accessToken=invalid-token']);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Authentication failed' });
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });

    test('should return 400 when invalid question ID provided', async () => {
      const response = await request(app)
          .get('/question?questionId=invalid')
          .set('Cookie', [`accessToken=${validToken}`]);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid Question ID' });
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });
  });

  describe('GET /questions', () => {
    const mockQuestions = [
      { 'Question ID': 1, 'Question Categories': 'Arrays', 'Question Complexity': 'Easy', '_id': 'mock-id-1' },
      { 'Question ID': 2, 'Question Categories': 'Strings', 'Question Complexity': 'Medium', '_id': 'mock-id-2' }
    ];

    test('should return filtered questions based on topic and difficulty', async () => {
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce(mockQuestions)
      });

      const response = await request(app)
          .get('/questions?topic=Arrays&difficulty=Easy')
          .set('Cookie', [`accessToken=${validToken}`]);

      expect(response.status).toBe(200);
      const returnedQuestions = mockQuestions.map(q => {
        const question = { ...q };
        delete question._id;
        return question;
      });
      expect(response.body).toEqual(returnedQuestions);
      expect(mockCollection.find).toHaveBeenCalledWith({
        'Question Categories': 'Arrays',
        'Question Complexity': 'Easy'
      }, { _id: 0 });
    });
  });

  describe('GET /question/random', () => {
    const mockQuestions = [
      { 'Question ID': 1, 'Question Categories': 'Arrays', 'Question Complexity': 'Easy', '_id': 'mock-id-1' },
      { 'Question ID': 2, 'Question Categories': 'Strings', 'Question Complexity': 'Medium', '_id': 'mock-id-2' }
    ];

    test('should return a random question with filters', async () => {
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce(mockQuestions)
      });

      const response = await request(app)
          .get('/question/random?topic=Arrays&difficulty=Easy');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(mockCollection.find).toHaveBeenCalledWith({
        'Question Categories': 'Arrays',
        'Question Complexity': 'Easy'
      });
    });

    test('should return 404 when no questions match criteria', async () => {
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce([])
      });

      const response = await request(app)
          .get('/question/random?topic=NonExistent');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'No questions found' });
    });
  });

  describe('POST /question', () => {
    const newQuestion = {
      id: 1,
      name: 'New Question',
      description: 'Test description',
      topics: ['Arrays'],
      difficulty: 'Easy'
    };

    test('should create new question when valid data provided', async () => {
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce([])
      });
      mockCollection.insertOne.mockResolvedValueOnce({ insertedId: 'new-id' });

      const response = await request(app)
          .post('/question')
          .set('Cookie', [`accessToken=${validToken}`])
          .send(newQuestion);

      expect(response.status).toBe(200);
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });

    test('should return 400 when required fields are missing', async () => {
      const invalidQuestion = { ...newQuestion };
      delete invalidQuestion.name;

      const response = await request(app)
          .post('/question')
          .set('Cookie', [`accessToken=${validToken}`])
          .send(invalidQuestion);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'name is required' });
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    test('should return 400 when invalid difficulty provided', async () => {
      const invalidQuestion = { ...newQuestion, difficulty: 'Invalid' };

      const response = await request(app)
          .post('/question')
          .set('Cookie', [`accessToken=${validToken}`])
          .send(invalidQuestion);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid Difficulty' });
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /question/:questionId', () => {
    test('should delete question when valid ID provided', async () => {
      mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

      const response = await request(app)
          .delete('/question/1')
          .set('Cookie', [`accessToken=${validToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ 'Question ID': 1 });
    });

    test('should return 400 when question not found', async () => {
      mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

      const response = await request(app)
          .delete('/question/999')
          .set('Cookie', [`accessToken=${validToken}`]);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ success: false });
    });
  });

  describe('PATCH /question/:questionId', () => {
    const updatedQuestion = {
      name: 'Updated Question',
      description: 'Updated description',
      topics: ['Arrays'],
      difficulty: 'Medium'
    };

    test('should update question when valid data provided', async () => {
      mockCollection.findOne.mockResolvedValueOnce({
        'Question ID': 1
      });
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValueOnce([])
      });
      mockCollection.replaceOne.mockResolvedValueOnce({ modifiedCount: 1 });

      const response = await request(app)
          .patch('/question/1')
          .set('Cookie', [`accessToken=${validToken}`])
          .send(updatedQuestion);

      expect(response.status).toBe(200);
      expect(mockCollection.replaceOne).toHaveBeenCalled();
    });

    test('should return 400 when question not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const response = await request(app)
          .patch('/question/999')
          .set('Cookie', [`accessToken=${validToken}`])
          .send(updatedQuestion);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Question Not Found' });
    });
  });
});