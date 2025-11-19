/**
 * Complete Express.js API Example
 * RESTful API with authentication, validation, and error handling
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

// Middleware
app.use(express.json());

// In-memory database (use real DB in production)
const users = [];
const posts = [];

// ===== MIDDLEWARE =====

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Validation middleware
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ===== AUTHENTICATION ROUTES =====

// Register
app.post('/api/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('name').trim().isLength({ min: 2 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      // Check if user exists
      if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = {
        id: users.length + 1,
        email,
        name,
        password: hashedPassword,
        createdAt: new Date()
      };
      
      users.push(user);
      
      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Login
app.post('/api/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ===== POST ROUTES =====

// Get all posts (with pagination)
app.get('/api/posts', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const paginatedPosts = posts.slice(skip, skip + limit);
  
  res.json({
    data: paginatedPosts,
    pagination: {
      page,
      limit,
      total: posts.length,
      totalPages: Math.ceil(posts.length / limit)
    }
  });
});

// Get single post
app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(post);
});

// Create post (protected)
app.post('/api/posts',
  authenticateToken,
  [
    body('title').trim().isLength({ min: 5, max: 100 }),
    body('content').trim().isLength({ min: 10 })
  ],
  validateRequest,
  (req, res) => {
    const { title, content } = req.body;
    
    const post = {
      id: posts.length + 1,
      title,
      content,
      authorId: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    posts.push(post);
    res.status(201).json(post);
  }
);

// Update post (protected)
app.put('/api/posts/:id',
  authenticateToken,
  [
    body('title').optional().trim().isLength({ min: 5, max: 100 }),
    body('content').optional().trim().isLength({ min: 10 })
  ],
  validateRequest,
  (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.authorId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;
    post.updatedAt = new Date();
    
    res.json(post);
  }
);

// Delete post (protected)
app.delete('/api/posts/:id', authenticateToken, (req, res) => {
  const index = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  const post = posts[index];
  if (post.authorId !== req.user.userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  posts.splice(index, 1);
  res.json({ message: 'Post deleted' });
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

