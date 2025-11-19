/**
 * Testing Examples
 * Jest testing patterns
 */

const request = require('supertest');
const app = require('./04-express-api');

describe('User API Tests', () => {
  let authToken;
  let userId;
  
  // Setup before all tests
  beforeAll(async () => {
    // Setup test database or mock data
  });
  
  // Cleanup after all tests
  afterAll(async () => {
    // Cleanup test data
  });
  
  // ===== UNIT TESTS =====
  describe('User Registration', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test1234'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });
    
    test('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Test1234'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
    });
    
    test('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
    });
  });
  
  describe('User Login', () => {
    test('should login with valid credentials', async () => {
      // First register a user
      await request(app)
        .post('/api/register')
        .send({
          name: 'Test User',
          email: 'login@example.com',
          password: 'Test1234'
        });
      
      // Then login
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'login@example.com',
          password: 'Test1234'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });
    
    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });
  });
  
  // ===== INTEGRATION TESTS =====
  describe('Post API', () => {
    test('should create a post when authenticated', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'login@example.com',
          password: 'Test1234'
        });
      
      const token = loginResponse.body.token;
      
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Post',
          content: 'This is a test post content'
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Post');
    });
    
    test('should reject post creation without authentication', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: 'Test Post',
          content: 'This is a test post content'
        })
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });
    
    test('should get paginated posts', async () => {
      const response = await request(app)
        .get('/api/posts?page=1&limit=10')
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  // ===== MOCKING EXAMPLES =====
  describe('With Mocks', () => {
    test('should mock external service', async () => {
      // Mock an external API call
      const axios = require('axios');
      jest.mock('axios');
      
      axios.get.mockResolvedValue({
        data: { id: 1, name: 'Mocked User' }
      });
      
      const result = await axios.get('/external-api');
      expect(result.data.name).toBe('Mocked User');
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });
  
  // ===== ASYNC TESTING =====
  describe('Async Operations', () => {
    test('should handle async operations', async () => {
      const asyncFunction = async () => {
        return new Promise(resolve => {
          setTimeout(() => resolve('done'), 100);
        });
      };
      
      const result = await asyncFunction();
      expect(result).toBe('done');
    });
    
    test('should handle errors in async operations', async () => {
      const asyncFunction = async () => {
        throw new Error('Test error');
      };
      
      await expect(asyncFunction()).rejects.toThrow('Test error');
    });
  });
  
  // ===== SNAPSHOT TESTING =====
  describe('Snapshot Tests', () => {
    test('should match snapshot', () => {
      const data = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z'
      };
      
      expect(data).toMatchSnapshot();
    });
  });
});

// ===== HELPER FUNCTIONS =====
function createTestUser() {
  return {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test1234'
  };
}

async function getAuthToken() {
  const user = createTestUser();
  await request(app).post('/api/register').send(user);
  
  const response = await request(app)
    .post('/api/login')
    .send({ email: user.email, password: user.password });
  
  return response.body.token;
}

