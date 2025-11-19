# JavaScript & Node.js Code Quality Standards

## Table of Contents
1. [Naming Conventions](#naming-conventions)
2. [Code Organization](#code-organization)
3. [Error Handling](#error-handling)
4. [Performance Standards](#performance-standards)
5. [Security Standards](#security-standards)
6. [Testing Standards](#testing-standards)
7. [Documentation Standards](#documentation-standards)

---

## Naming Conventions

### Variables and Functions
```javascript
// ✅ Good: camelCase, descriptive
const userName = 'John';
const isActive = true;
const getUserData = () => {};

// ❌ Bad: Unclear, abbreviations
const u = 'John';
const flag = true;
const get = () => {};
```

### Constants
```javascript
// ✅ Good: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;

// ❌ Bad: camelCase for constants
const maxRetryAttempts = 3;
```

### Classes
```javascript
// ✅ Good: PascalCase
class UserService {}
class DatabaseConnection {}
class HttpRequestHandler {}

// ❌ Bad: camelCase
class userService {}
```

### Private Properties
```javascript
// ✅ Good: #private (ES2022) or _prefix (convention)
class User {
  #privateId = 123; // Truly private
  _internalState = {}; // Convention (still accessible)
  
  getPrivateId() {
    return this.#privateId;
  }
}
```

---

## Code Organization

### File Structure
```
project/
├── src/
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── models/         # Data models
│   ├── middleware/     # Express middleware
│   ├── utils/          # Helper functions
│   ├── config/         # Configuration
│   └── routes/         # Route definitions
├── tests/
├── docs/
└── package.json
```

### Function Design Principles

**Single Responsibility Principle:**
```javascript
// ❌ Bad: Multiple responsibilities
function processUser(user) {
  // Validation
  if (!user.email) throw new Error('Email required');
  
  // Transformation
  user.email = user.email.toLowerCase();
  
  // Database operation
  database.save(user);
  
  // Notification
  emailService.send(user.email);
}

// ✅ Good: Single responsibility
function validateUser(user) {
  if (!user.email) throw new Error('Email required');
}

function normalizeUser(user) {
  return { ...user, email: user.email.toLowerCase() };
}

async function processUser(user) {
  validateUser(user);
  const normalized = normalizeUser(user);
  await saveUser(normalized);
  await notifyUser(normalized);
}
```

**Function Length:**
```javascript
// ✅ Good: Small, focused functions (10-20 lines)
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad: Long function (50+ lines)
function processOrder(order) {
  // 50+ lines of code doing multiple things
}
```

---

## Error Handling

### Always Handle Errors
```javascript
// ❌ Bad: No error handling
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  return await response.json();
}

// ✅ Good: Proper error handling
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Failed to fetch user:', error);
    throw new Error(`Unable to fetch user ${id}: ${error.message}`);
  }
}
```

### Custom Error Classes
```javascript
// ✅ Good: Custom error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.id = id;
  }
}

// Usage
if (!user.email) {
  throw new ValidationError('Email is required', 'email');
}
```

### Error Handling in Express
```javascript
// ✅ Good: Centralized error handling
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: err.message,
      field: err.field
    });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: err.message
    });
  }
  
  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  
  res.status(err.status || 500).json({ error: message });
});
```

---

## Performance Standards

### Avoid Blocking Operations
```javascript
// ❌ Bad: Blocking synchronous operation
const data = fs.readFileSync('large-file.txt');

// ✅ Good: Asynchronous operation
const data = await fs.promises.readFile('large-file.txt');
```

### Use Connection Pooling
```javascript
// ✅ Good: Connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000
});

async function query(sql, params) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}
```

### Implement Caching
```javascript
// ✅ Good: Cache expensive operations
const cache = new NodeCache({ stdTTL: 600 });

async function getExpensiveData(key) {
  const cached = cache.get(key);
  if (cached) return cached;
  
  const data = await expensiveOperation();
  cache.set(key, data);
  return data;
}
```

### Optimize Database Queries
```javascript
// ❌ Bad: N+1 queries
const posts = await Post.find();
for (const post of posts) {
  post.author = await User.findById(post.authorId);
}

// ✅ Good: Single query with populate
const posts = await Post.find().populate('authorId');

// ❌ Bad: Selecting all fields
const users = await User.find();

// ✅ Good: Select only needed fields
const users = await User.find().select('name email');
```

---

## Security Standards

### Input Validation
```javascript
// ✅ Good: Always validate input
const { body, validationResult } = require('express-validator');

app.post('/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('age').isInt({ min: 0, max: 120 })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

### Prevent SQL Injection
```javascript
// ❌ Bad: Vulnerable to SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Good: Parameterized queries
const query = 'SELECT * FROM users WHERE email = $1';
await pool.query(query, [email]);
```

### Secure Password Handling
```javascript
// ✅ Good: Hash passwords
const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashedPassword = await bcrypt.hash(password, saltRounds);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Use Environment Variables
```javascript
// ✅ Good: Use environment variables for secrets
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
const dbUrl = process.env.DATABASE_URL;

// ❌ Bad: Hardcoded secrets
const jwtSecret = 'my-secret-key';
```

### Security Headers
```javascript
// ✅ Good: Use helmet for security headers
const helmet = require('helmet');
app.use(helmet());

// ✅ Good: Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

---

## Testing Standards

### Test Structure
```javascript
// ✅ Good: Clear test structure
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      const userData = { name: 'John', email: 'john@example.com' };
      const user = await userService.create(userData);
      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
    });
    
    it('should throw error for invalid email', async () => {
      const userData = { name: 'John', email: 'invalid-email' };
      await expect(userService.create(userData))
        .rejects.toThrow('Invalid email');
    });
  });
});
```

### Test Coverage
- Aim for 80%+ code coverage
- Test happy paths and error cases
- Test edge cases and boundary conditions
- Mock external dependencies

### Test Naming
```javascript
// ✅ Good: Descriptive test names
it('should return user when valid ID is provided', () => {});
it('should throw NotFoundError when user does not exist', () => {});
it('should return empty array when no users match filter', () => {});

// ❌ Bad: Vague test names
it('should work', () => {});
it('test 1', () => {});
```

---

## Documentation Standards

### JSDoc Comments
```javascript
/**
 * Calculates the total price including tax
 * @param {number} price - Base price
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns {number} Total price with tax
 * @throws {Error} If price is negative
 * @example
 * calculateTotal(100, 0.1) // Returns 110
 */
function calculateTotal(price, taxRate) {
  if (price < 0) {
    throw new Error('Price cannot be negative');
  }
  return price * (1 + taxRate);
}
```

### Code Comments
```javascript
// ✅ Good: Explain why, not what
// Using bitwise OR for faster integer conversion
const id = userId | 0;

// ✅ Good: Explain complex logic
// Calculate compound interest using formula: A = P(1 + r/n)^(nt)
const amount = principal * Math.pow(1 + rate / periods, periods * time);

// ❌ Bad: Comments explain what code does
// Increment i by 1
i++;
```

### README Standards
- Clear project description
- Installation instructions
- Usage examples
- API documentation
- Contributing guidelines

---

## Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Handles edge cases
- [ ] Error handling is proper
- [ ] No obvious bugs

### Code Quality
- [ ] Follows naming conventions
- [ ] Functions are small and focused
- [ ] No code duplication
- [ ] Proper use of async/await

### Performance
- [ ] No blocking operations
- [ ] Database queries are optimized
- [ ] Caching is used where appropriate
- [ ] No memory leaks

### Security
- [ ] Input validation
- [ ] No SQL injection vulnerabilities
- [ ] Secrets are in environment variables
- [ ] Security headers are set

### Testing
- [ ] Tests are written
- [ ] Tests pass
- [ ] Good test coverage
- [ ] Tests are maintainable

---

## Common Code Smells

### 1. Long Functions
```javascript
// ❌ Bad: 50+ lines
function processOrder(order) {
  // 50+ lines
}

// ✅ Good: Break into smaller functions
function validateOrder(order) {}
function calculateTotal(order) {}
function processPayment(order) {}
function sendConfirmation(order) {}
```

### 2. Magic Numbers
```javascript
// ❌ Bad: Magic numbers
if (user.age >= 18) {}

// ✅ Good: Named constants
const MIN_AGE = 18;
if (user.age >= MIN_AGE) {}
```

### 3. Deep Nesting
```javascript
// ❌ Bad: Deep nesting
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      // ...
    }
  }
}

// ✅ Good: Early returns
if (!user) return;
if (!user.isActive) return;
if (!user.hasPermission) return;
// ...
```

### 4. Duplicate Code
```javascript
// ❌ Bad: Duplicate code
function validateUser(user) {
  if (!user.name) throw new Error('Name required');
  if (!user.email) throw new Error('Email required');
}

function validatePost(post) {
  if (!post.title) throw new Error('Title required');
  if (!post.content) throw new Error('Content required');
}

// ✅ Good: Reusable validation
function validateRequired(obj, fields) {
  fields.forEach(field => {
    if (!obj[field]) {
      throw new Error(`${field} is required`);
    }
  });
}
```

---

Follow these standards to write maintainable, secure, and performant Node.js code. Regular code reviews help ensure these standards are followed.

