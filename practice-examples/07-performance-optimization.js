/**
 * Performance Optimization Techniques
 * Caching, Connection Pooling, Query Optimization
 */

const express = require('express');
const NodeCache = require('node-cache');
const redis = require('redis');
const { Pool } = require('pg');

const app = express();

// ===== IN-MEMORY CACHING =====
const cache = new NodeCache({
  stdTTL: 600, // Default TTL: 10 minutes
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Better performance
});

// Cache middleware
function cacheMiddleware(duration = 600) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = req.originalUrl || req.url;
    const cached = cache.get(key);
    
    if (cached) {
      console.log('Cache hit:', key);
      return res.json(cached);
    }
    
    // Store original json method
    res.originalJson = res.json;
    
    // Override json method to cache response
    res.json = function(body) {
      cache.set(key, body, duration);
      console.log('Cache set:', key);
      res.originalJson(body);
    };
    
    next();
  };
}

// Usage
app.get('/api/users', cacheMiddleware(300), async (req, res) => {
  // Expensive database query
  const users = await fetchUsersFromDB();
  res.json(users);
});

// Cache invalidation
function invalidateCache(pattern) {
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.del(key);
    }
  });
}

// ===== REDIS CACHING =====
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

async function getCachedData(key) {
  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (err) {
    console.error('Redis get error:', err);
    return null;
  }
}

async function setCachedData(key, data, ttl = 3600) {
  try {
    await redisClient.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.error('Redis set error:', err);
  }
}

// Redis cache middleware
async function redisCacheMiddleware(req, res, next) {
  if (req.method !== 'GET') {
    return next();
  }
  
  const key = `cache:${req.originalUrl}`;
  const cached = await getCachedData(key);
  
  if (cached) {
    return res.json(cached);
  }
  
  res.originalJson = res.json;
  res.json = async function(body) {
    await setCachedData(key, body, 300);
    res.originalJson(body);
  };
  
  next();
}

// ===== CONNECTION POOLING =====

// PostgreSQL Connection Pool
const pgPool = new Pool({
  host: 'localhost',
  database: 'mydb',
  user: 'user',
  password: 'password',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection cannot be established
});

// Use connection pool
async function queryWithPool(query, params) {
  const client = await pgPool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release(); // Important: always release connection
  }
}

// ===== DATABASE QUERY OPTIMIZATION =====

// 1. Use indexes
// CREATE INDEX idx_user_email ON users(email);
// CREATE INDEX idx_user_status_created ON users(status, created_at);

// 2. Select only needed fields
async function getUsersOptimized() {
  // Bad: SELECT * FROM users
  // Good: SELECT id, name, email FROM users
  const query = 'SELECT id, name, email FROM users WHERE status = $1';
  return await queryWithPool(query, ['active']);
}

// 3. Use LIMIT and OFFSET for pagination
async function getUsersPaginated(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const query = `
    SELECT id, name, email 
    FROM users 
    WHERE status = $1 
    ORDER BY created_at DESC 
    LIMIT $2 OFFSET $3
  `;
  return await queryWithPool(query, ['active', limit, offset]);
}

// 4. Use prepared statements (parameterized queries)
async function getUserById(id) {
  // Good: Parameterized query (prevents SQL injection)
  const query = 'SELECT * FROM users WHERE id = $1';
  return await queryWithPool(query, [id]);
}

// 5. Batch operations
async function batchInsertUsers(users) {
  const values = users.map((user, index) => {
    const base = index * 3;
    return `($${base + 1}, $${base + 2}, $${base + 3})`;
  }).join(', ');
  
  const params = users.flatMap(user => [user.name, user.email, user.status]);
  const query = `INSERT INTO users (name, email, status) VALUES ${values}`;
  
  return await queryWithPool(query, params);
}

// ===== COMPRESSION =====
const compression = require('compression');
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Compression level (0-9)
}));

// ===== REQUEST BATCHING =====
class RequestBatcher {
  constructor(batchSize = 10, delay = 50) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.timer = null;
  }
  
  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      
      if (this.queue.length >= this.batchSize) {
        this.processBatch();
      } else if (!this.timer) {
        this.timer = setTimeout(() => {
          this.processBatch();
        }, this.delay);
      }
    });
  }
  
  async processBatch() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, this.batchSize);
    const requests = batch.map(item => item.request);
    
    try {
      // Process batch (e.g., batch database query)
      const results = await processBatchRequests(requests);
      
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (err) {
      batch.forEach(item => {
        item.reject(err);
      });
    }
    
    if (this.queue.length > 0) {
      this.timer = setTimeout(() => {
        this.processBatch();
      }, this.delay);
    }
  }
}

// ===== LAZY LOADING =====
class LazyLoader {
  constructor(loader) {
    this.loader = loader;
    this.cache = null;
    this.loading = false;
    this.pending = [];
  }
  
  async get() {
    if (this.cache) {
      return this.cache;
    }
    
    if (this.loading) {
      return new Promise((resolve) => {
        this.pending.push(resolve);
      });
    }
    
    this.loading = true;
    try {
      this.cache = await this.loader();
      this.pending.forEach(resolve => resolve(this.cache));
      this.pending = [];
      return this.cache;
    } finally {
      this.loading = false;
    }
  }
  
  invalidate() {
    this.cache = null;
  }
}

// ===== DEBOUNCING AND THROTTLING =====

// Debounce: Execute function after delay, cancel if called again
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Throttle: Execute function at most once per delay
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

// Usage
const debouncedSearch = debounce((query) => {
  // Perform search
  console.log('Searching for:', query);
}, 300);

const throttledScroll = throttle(() => {
  // Handle scroll
  console.log('Scroll event');
}, 100);

// ===== MEMORY OPTIMIZATION =====

// 1. Use streams for large data
const fs = require('fs');
function processLargeFile(inputPath, outputPath) {
  const readStream = fs.createReadStream(inputPath);
  const writeStream = fs.createWriteStream(outputPath);
  
  readStream.pipe(writeStream);
}

// 2. Limit array sizes
function processInChunks(array, chunkSize, processor) {
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    processor(chunk);
  }
}

// 3. Use WeakMap for temporary references
const weakMap = new WeakMap();
function setTempData(obj, data) {
  weakMap.set(obj, data);
}

// ===== MONITORING =====
const promClient = require('prom-client');

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
  });
  
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

module.exports = {
  cache,
  redisClient,
  pgPool,
  getCachedData,
  setCachedData,
  queryWithPool
};

