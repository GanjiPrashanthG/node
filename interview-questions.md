# Node.js Interview Questions & Answers

## Table of Contents
1. [Basic Questions](#basic-questions)
2. [Intermediate Questions](#intermediate-questions)
3. [Advanced Questions](#advanced-questions)
4. [System Design Questions](#system-design-questions)
5. [Coding Challenges](#coding-challenges)

---

## Basic Questions

### Q1: What is Node.js and how does it differ from JavaScript in the browser?

**Answer:**
Node.js is a JavaScript runtime environment built on Chrome's V8 JavaScript engine. It allows JavaScript to run on the server-side.

**Key Differences:**
- **Environment**: Browser JavaScript runs in browsers, Node.js runs on servers
- **APIs**: Node.js provides APIs for file system, HTTP servers, etc., which aren't available in browsers
- **Global Objects**: Browser has `window`, Node.js has `global` and `process`
- **Module System**: Browsers use ES6 modules, Node.js uses CommonJS by default
- **Purpose**: Browser JS manipulates DOM, Node.js handles server operations

### Q2: Explain the Event Loop in Node.js.

**Answer:**
The Event Loop is the core mechanism that allows Node.js to perform non-blocking I/O operations.

**Phases:**
1. **Timers**: Executes callbacks scheduled by `setTimeout()` and `setInterval()`
2. **Pending Callbacks**: Executes I/O callbacks deferred to next iteration
3. **Idle, Prepare**: Internal use only
4. **Poll**: Fetches new I/O events, executes I/O related callbacks
5. **Check**: Executes `setImmediate()` callbacks
6. **Close Callbacks**: Executes close callbacks (e.g., `socket.on('close')`)

**Execution Order:**
```javascript
process.nextTick() > Promise.then() > setTimeout() > setImmediate()
```

### Q3: What is the difference between `require()` and `import()`?

**Answer:**

| Feature | require() | import() |
|---------|-----------|----------|
| Type | CommonJS | ES6 Modules |
| Loading | Synchronous | Asynchronous (can be) |
| Location | Can be anywhere | Must be at top level |
| Returns | Module.exports object | Promise (dynamic import) |
| Default | Node.js default | Needs "type": "module" |

**Example:**
```javascript
// CommonJS
const module = require('./module');
module.exports = { ... };

// ES6
import module from './module.js';
export default { ... };

// Dynamic import
const module = await import('./module.js');
```

### Q4: What are streams and why are they important?

**Answer:**
Streams are objects that let you read/write data continuously, piece by piece, rather than loading everything into memory.

**Types:**
- **Readable**: Can read data from (e.g., `fs.createReadStream()`)
- **Writable**: Can write data to (e.g., `fs.createWriteStream()`)
- **Duplex**: Both readable and writable
- **Transform**: Duplex stream that can modify data as it passes through

**Benefits:**
- Memory efficient (handle large files)
- Time efficient (start processing before all data is available)
- Composable (pipe streams together)

**Example:**
```javascript
const fs = require('fs');
fs.createReadStream('input.txt')
  .pipe(transformStream)
  .pipe(fs.createWriteStream('output.txt'));
```

### Q5: Explain the difference between `process.nextTick()` and `setImmediate()`.

**Answer:**

**process.nextTick():**
- Executes in the current phase, before any other async operation
- Higher priority than Promises and timers
- Can starve the event loop if used recursively

**setImmediate():**
- Executes in the Check phase, after the Poll phase
- Lower priority than `nextTick()`
- Better for I/O operations

**Example:**
```javascript
console.log('1');
process.nextTick(() => console.log('2'));
setImmediate(() => console.log('3'));
Promise.resolve().then(() => console.log('4'));
console.log('5');

// Output: 1, 5, 2, 4, 3
```

---

## Intermediate Questions

### Q6: How do you handle errors in Node.js?

**Answer:**

**1. Try-Catch (Synchronous & Async/Await):**
```javascript
try {
  const data = await fs.promises.readFile('file.txt');
} catch (err) {
  console.error('Error:', err);
}
```

**2. Callback Pattern (Error-first):**
```javascript
fs.readFile('file.txt', (err, data) => {
  if (err) {
    return console.error('Error:', err);
  }
  // Process data
});
```

**3. Promise Catch:**
```javascript
fs.promises.readFile('file.txt')
  .then(data => {})
  .catch(err => console.error('Error:', err));
```

**4. Global Error Handlers:**
```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
```

**5. Express Error Middleware:**
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

### Q7: How do you scale Node.js applications?

**Answer:**

**1. Horizontal Scaling (Cluster Module):**
```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Worker process
  http.createServer(app).listen(3000);
}
```

**2. Load Balancing:**
- Use Nginx, HAProxy, or cloud load balancers
- Distribute requests across multiple instances

**3. Caching:**
- Redis for session and data caching
- CDN for static assets
- Application-level caching

**4. Database Optimization:**
- Connection pooling
- Read replicas
- Query optimization
- Indexing

**5. Microservices:**
- Split application into smaller services
- Use message queues (RabbitMQ, Kafka)
- API Gateway pattern

**6. Process Management:**
- PM2 for process management
- Docker containers
- Kubernetes for orchestration

### Q8: What is middleware in Express.js?

**Answer:**
Middleware functions are functions that have access to the request object (`req`), response object (`res`), and the `next` function in the application's request-response cycle.

**Types:**
1. **Application-level**: `app.use()`
2. **Router-level**: `router.use()`
3. **Error-handling**: `app.use((err, req, res, next) => {})`
4. **Built-in**: `express.json()`, `express.static()`
5. **Third-party**: `cors`, `helmet`, `morgan`

**Example:**
```javascript
// Custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // Pass control to next middleware
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});
```

### Q9: Explain the difference between `exec()`, `spawn()`, and `fork()`.

**Answer:**

| Method | Use Case | Output | Process Type |
|--------|----------|--------|--------------|
| `exec()` | Short commands, need shell | Buffered | Spawns shell |
| `spawn()` | Long-running, streaming | Streamed | Direct process |
| `fork()` | Node.js scripts, IPC | Streamed | Node.js process |

**Examples:**

```javascript
// exec() - Buffers output
const { exec } = require('child_process');
exec('ls -la', (error, stdout, stderr) => {
  console.log(stdout);
});

// spawn() - Streams output
const { spawn } = require('child_process');
const ls = spawn('ls', ['-la']);
ls.stdout.on('data', (data) => {
  console.log(data.toString());
});

// fork() - Node.js process with IPC
const { fork } = require('child_process');
const child = fork('child.js');
child.send({ message: 'Hello' });
child.on('message', (msg) => {
  console.log('From child:', msg);
});
```

### Q10: How do you implement authentication in Node.js?

**Answer:**

**1. JWT (JSON Web Tokens):**
```javascript
const jwt = require('jsonwebtoken');

// Generate token
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// Middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
```

**2. Session-based:**
```javascript
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true }
}));
```

**3. OAuth 2.0:**
```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Handle user
  done(null, user);
}));
```

---

## Advanced Questions

### Q11: How do you prevent memory leaks in Node.js?

**Answer:**

**Common Causes:**
1. Global variables
2. Closures holding references
3. Event listeners not removed
4. Timers not cleared
5. Circular references

**Prevention:**
```javascript
// 1. Remove event listeners
emitter.on('event', handler);
emitter.removeListener('event', handler);

// 2. Clear timers
const timer = setInterval(() => {}, 1000);
clearInterval(timer);

// 3. Use WeakMap/WeakSet
const weakMap = new WeakMap();
weakMap.set(obj, data); // Automatically garbage collected

// 4. Close database connections
await mongoose.connection.close();

// 5. Monitor memory
const used = process.memoryUsage();
console.log(used);
```

**Tools:**
- `clinic.js` - Performance profiling
- `node-memwatch` - Memory leak detection
- `heapdump` - Generate heap snapshots

### Q12: Explain how you would implement rate limiting.

**Answer:**

**1. Using express-rate-limit:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

**2. Redis-based (for distributed systems):**
```javascript
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient();

const limiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rl:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

**3. Custom implementation:**
```javascript
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests
    const recentRequests = userRequests.filter(
      time => now - time < this.windowMs
    );
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }
}
```

### Q13: How do you optimize database queries in Node.js?

**Answer:**

**1. Use Indexes:**
```javascript
// MongoDB
userSchema.index({ email: 1 });
userSchema.index({ status: 1, createdAt: -1 }); // Compound index

// PostgreSQL
// CREATE INDEX idx_user_email ON users(email);
```

**2. Select Only Needed Fields:**
```javascript
// Bad
const users = await User.find();

// Good
const users = await User.find().select('name email');
```

**3. Use Pagination:**
```javascript
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;
const users = await User.find().skip(skip).limit(limit);
```

**4. Avoid N+1 Queries:**
```javascript
// Bad - N+1 queries
const posts = await Post.find();
for (const post of posts) {
  post.author = await User.findById(post.authorId);
}

// Good - Single query with populate
const posts = await Post.find().populate('authorId');
```

**5. Use Aggregation Pipelines:**
```javascript
const stats = await User.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: '$role', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

**6. Connection Pooling:**
```javascript
const pool = new Pool({
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000
});
```

**7. Use Lean (Mongoose):**
```javascript
// Returns plain objects, faster
const users = await User.find().lean();
```

### Q14: Explain WebSockets and how to implement them.

**Answer:**

WebSockets provide full-duplex communication channels over a single TCP connection, enabling real-time data exchange.

**Implementation with ws library:**
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});
```

**With Socket.io (more features):**
```javascript
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });
  
  socket.on('message', (data) => {
    io.to(data.roomId).emit('message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

### Q15: How do you implement graceful shutdown?

**Answer:**

```javascript
const server = app.listen(3000);

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  shutdown();
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  shutdown();
});

function shutdown() {
  server.close(() => {
    console.log('HTTP server closed');
    
    // Close database connections
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
    
    // Close Redis connections
    redisClient.quit(() => {
      console.log('Redis connection closed');
    });
  });
  
  // Force close after timeout
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 10000);
}
```

---

## System Design Questions

### Q16: Design a URL Shortener Service

**Requirements:**
- Shorten long URLs
- Redirect to original URL
- Analytics (click count)
- Custom short URLs (optional)

**Components:**
1. **API Server** (Express.js)
2. **Database** (Redis for cache, PostgreSQL for persistence)
3. **Load Balancer**
4. **CDN** for static assets

**Key Endpoints:**
```
POST /api/shorten - Create short URL
GET /:shortCode - Redirect to original URL
GET /api/analytics/:shortCode - Get analytics
```

**Database Schema:**
```sql
CREATE TABLE urls (
  short_code VARCHAR(10) PRIMARY KEY,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  click_count INT DEFAULT 0,
  user_id INT,
  expires_at TIMESTAMP
);

CREATE INDEX idx_user_id ON urls(user_id);
CREATE INDEX idx_created_at ON urls(created_at);
```

**Algorithm:**
```javascript
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function shortenUrl(originalUrl) {
  let code = generateShortCode();
  
  // Check for collisions
  while (await urlExists(code)) {
    code = generateShortCode();
  }
  
  await db.query(
    'INSERT INTO urls (short_code, original_url) VALUES ($1, $2)',
    [code, originalUrl]
  );
  
  // Cache in Redis
  await redis.setex(`url:${code}`, 3600, originalUrl);
  
  return code;
}
```

### Q17: Design a Real-time Chat Application

**Requirements:**
- Real-time messaging
- Multiple chat rooms
- User presence
- Message history

**Components:**
1. **WebSocket Server** (Socket.io)
2. **Message Queue** (Redis Pub/Sub)
3. **Database** (MongoDB for messages)
4. **Authentication** (JWT)

**Architecture:**
```javascript
// WebSocket server
const io = require('socket.io')(server);

io.use((socket, next) => {
  // Authenticate
  const token = socket.handshake.auth.token;
  const user = jwt.verify(token, process.env.JWT_SECRET);
  socket.userId = user.id;
  next();
});

io.on('connection', (socket) => {
  socket.on('join-room', async (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.userId);
  });
  
  socket.on('message', async (data) => {
    // Save to database
    const message = await Message.create({
      roomId: data.roomId,
      userId: socket.userId,
      content: data.content,
      timestamp: new Date()
    });
    
    // Broadcast to room
    io.to(data.roomId).emit('message', message);
    
    // Publish to Redis for multi-server setup
    redis.publish(`room:${data.roomId}`, JSON.stringify(message));
  });
  
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-left', socket.userId);
  });
});
```

---

## Coding Challenges

### Challenge 1: Implement a Promise.all() polyfill

```javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      return resolve([]);
    }
    
    const results = [];
    let completed = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}
```

### Challenge 2: Implement a debounce function

```javascript
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage
const debouncedSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);
```

### Challenge 3: Implement a rate limiter

```javascript
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Filter out old requests
    const recentRequests = userRequests.filter(
      time => now - time < this.windowMs
    );
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }
}
```

### Challenge 4: Implement a simple cache

```javascript
class SimpleCache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  delete(key) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
}
```

---

## Tips for the Interview

1. **Understand the Basics**: Event loop, streams, async patterns
2. **Know Your Frameworks**: Express.js deeply, others at surface level
3. **Database Expertise**: Both SQL and NoSQL, understand trade-offs
4. **Security**: Always mention input validation, authentication, SQL injection prevention
5. **Performance**: Caching, connection pooling, query optimization
6. **Best Practices**: Error handling, logging, code organization
7. **Be Honest**: If you don't know something, say so and explain how you would find out

Good luck! 🚀

