# Complete Node.js Interview Questions with Standard Answers

## Table of Contents
1. [JavaScript Fundamentals](#javascript-fundamentals)
2. [Node.js Core Concepts](#nodejs-core-concepts)
3. [Asynchronous Programming](#asynchronous-programming)
4. [Frameworks & APIs](#frameworks--apis)
5. [Database & Performance](#database--performance)
6. [Security & Best Practices](#security--best-practices)
7. [System Design](#system-design)
8. [Coding Problems](#coding-problems)

---

## JavaScript Fundamentals

### Q1: Explain `this` keyword in JavaScript

**Standard Answer:**
`this` refers to the object that is executing the current function. Its value depends on how the function is called:

1. **Global context**: `this` refers to the global object (window in browser, global in Node.js)
2. **Object method**: `this` refers to the object calling the method
3. **Constructor**: `this` refers to the newly created instance
4. **Arrow functions**: `this` is lexically bound (inherits from enclosing scope)
5. **Event handlers**: `this` refers to the element that received the event

**Example:**
```javascript
// Global context
console.log(this); // global object

// Object method
const obj = {
  name: 'John',
  greet: function() {
    console.log(this.name); // 'John'
  }
};

// Arrow function (lexical this)
const obj2 = {
  name: 'John',
  greet: () => {
    console.log(this.name); // undefined (this is global)
  },
  greet2: function() {
    const inner = () => {
      console.log(this.name); // 'John' (inherits from greet2)
    };
    inner();
  }
};

// Constructor
function Person(name) {
  this.name = name;
}
const person = new Person('John');
console.log(person.name); // 'John'
```

**Common Interview Follow-up:**
**Q: How do you fix `this` binding issues?**

**Standard Answer:**
```javascript
// Problem: this is lost
const obj = {
  name: 'John',
  greet: function() {
    setTimeout(function() {
      console.log(this.name); // undefined
    }, 100);
  }
};

// Solution 1: Arrow function
const obj = {
  name: 'John',
  greet: function() {
    setTimeout(() => {
      console.log(this.name); // 'John'
    }, 100);
  }
};

// Solution 2: bind()
const obj = {
  name: 'John',
  greet: function() {
    setTimeout(function() {
      console.log(this.name);
    }.bind(this), 100);
  }
};

// Solution 3: Store this
const obj = {
  name: 'John',
  greet: function() {
    const self = this;
    setTimeout(function() {
      console.log(self.name); // 'John'
    }, 100);
  }
};
```

---

### Q2: Explain Closures in JavaScript

**Standard Answer:**
A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned. Closures are created every time a function is created.

**Key Points:**
- Inner function has access to outer function's variables
- Variables persist even after outer function execution completes
- Each closure has its own scope

**Example:**
```javascript
function outerFunction(x) {
  // Outer function's variable
  const outerVariable = x;
  
  // Inner function (closure)
  function innerFunction(y) {
    console.log(outerVariable + y); // Accesses outerVariable
  }
  
  return innerFunction;
}

const closure = outerFunction(10);
closure(5); // 15 (still has access to outerVariable)

// Real-world example: Counter
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount()); // 2
```

**Common Interview Problem:**
**Q: What's wrong with this code?**
```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // Prints 3, 3, 3
  }, 100);
}
```

**Standard Answer:**
The problem is that `var` is function-scoped, so all closures share the same `i`. By the time the callbacks execute, `i` is already 3.

**Solutions:**
```javascript
// Solution 1: Use let (block-scoped)
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 0, 1, 2
  }, 100);
}

// Solution 2: IIFE (Immediately Invoked Function Expression)
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => {
      console.log(j); // 0, 1, 2
    }, 100);
  })(i);
}

// Solution 3: bind()
for (var i = 0; i < 3; i++) {
  setTimeout(function(j) {
    console.log(j);
  }.bind(null, i), 100);
}
```

---

### Q3: Explain Prototypes and Prototypal Inheritance

**Standard Answer:**
JavaScript uses prototypal inheritance. Every object has a prototype, and when a property is accessed, JavaScript looks up the prototype chain until it finds the property or reaches `null`.

**Key Concepts:**
- `__proto__`: Reference to the object's prototype (deprecated, use `Object.getPrototypeOf()`)
- `prototype`: Property of constructor functions
- Prototype chain: Mechanism for inheritance

**Example:**
```javascript
// Constructor function
function Person(name) {
  this.name = name;
}

// Add method to prototype
Person.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};

const person = new Person('John');
console.log(person.greet()); // "Hello, I'm John"

// person doesn't have greet method, but Person.prototype does
console.log(person.hasOwnProperty('greet')); // false
console.log('greet' in person); // true (found in prototype)

// Prototype chain
console.log(person.__proto__ === Person.prototype); // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__); // null

// ES6 Classes (syntactic sugar for prototypes)
class Person {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    return `Hello, I'm ${this.name}`;
  }
}
```

---

### Q4: What is Hoisting?

**Standard Answer:**
Hoisting is JavaScript's behavior of moving declarations to the top of their scope before code execution. Only declarations are hoisted, not initializations.

**Key Points:**
- `var` declarations are hoisted and initialized with `undefined`
- `let` and `const` are hoisted but not initialized (Temporal Dead Zone)
- Function declarations are fully hoisted
- Function expressions are not hoisted

**Example:**
```javascript
// var hoisting
console.log(x); // undefined (not ReferenceError)
var x = 5;

// Equivalent to:
var x;
console.log(x);
x = 5;

// let/const hoisting (TDZ)
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 5;

// Function declaration hoisting
sayHello(); // "Hello" (works!)

function sayHello() {
  console.log('Hello');
}

// Function expression (not hoisted)
sayGoodbye(); // TypeError: sayGoodbye is not a function
var sayGoodbye = function() {
  console.log('Goodbye');
};
```

---

## Node.js Core Concepts

### Q5: Explain the Event Loop in Detail

**Standard Answer:**
The Event Loop is Node.js's mechanism for handling asynchronous operations. It continuously checks for completed operations and executes their callbacks.

**Phases:**
1. **Timers**: Executes `setTimeout()` and `setInterval()` callbacks
2. **Pending Callbacks**: Executes deferred I/O callbacks
3. **Idle, Prepare**: Internal use
4. **Poll**: Fetches new I/O events, executes I/O callbacks
5. **Check**: Executes `setImmediate()` callbacks
6. **Close Callbacks**: Executes close callbacks (e.g., `socket.on('close')`)

**Execution Order:**
```
process.nextTick() > Promise.then() > setTimeout() > setImmediate()
```

**Example:**
```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);
setImmediate(() => console.log('3'));
Promise.resolve().then(() => console.log('4'));
process.nextTick(() => console.log('5'));

console.log('6');

// Output: 1, 6, 5, 4, 2, 3
```

**Interview Follow-up:**
**Q: Why does setImmediate sometimes run before setTimeout?**

**Standard Answer:**
In the I/O cycle, `setImmediate()` runs in the Check phase, which comes after the Poll phase. However, if `setTimeout()` is called outside of an I/O cycle, it may execute in the next tick, potentially after `setImmediate()`. The order depends on the current phase of the event loop.

---

### Q6: What is the Difference Between process.nextTick() and setImmediate()?

**Standard Answer:**

| Feature | process.nextTick() | setImmediate() |
|---------|-------------------|----------------|
| Phase | Runs before any other phase | Runs in Check phase |
| Priority | Highest | Lower than nextTick |
| Starvation | Can starve event loop | Cannot starve event loop |
| Use Case | Ensure callback runs before event loop continues | Schedule callback for next iteration |

**Example:**
```javascript
console.log('Start');

setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick'));

console.log('End');

// Output: Start, End, nextTick, setImmediate
```

**When to Use:**
- `process.nextTick()`: When you need to ensure a callback runs before the event loop continues (e.g., error handling, cleanup)
- `setImmediate()`: When you want to schedule a callback for the next iteration of the event loop

---

### Q7: Explain Streams in Node.js

**Standard Answer:**
Streams are objects that let you read/write data continuously, piece by piece, rather than loading everything into memory.

**Types:**
1. **Readable**: Can read data from (e.g., `fs.createReadStream()`)
2. **Writable**: Can write data to (e.g., `fs.createWriteStream()`)
3. **Duplex**: Both readable and writable
4. **Transform**: Duplex stream that modifies data

**Benefits:**
- Memory efficient (handle large files)
- Time efficient (start processing before all data arrives)
- Composable (pipe streams together)

**Example:**
```javascript
const fs = require('fs');

// Copy large file efficiently
fs.createReadStream('large-file.txt')
  .pipe(fs.createWriteStream('copy.txt'));

// Transform stream
const { Transform } = require('stream');
const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

fs.createReadStream('input.txt')
  .pipe(upperCase)
  .pipe(fs.createWriteStream('output.txt'));
```

---

## Asynchronous Programming

### Q8: Explain the Difference Between Promises and Callbacks

**Standard Answer:**

| Feature | Callbacks | Promises |
|---------|-----------|----------|
| Readability | Can lead to callback hell | Cleaner, chainable |
| Error Handling | Error-first pattern | Single `.catch()` |
| Composition | Difficult | Easy with `.then()` |
| Parallel Execution | Manual | `Promise.all()` |
| State | No state | Pending/Fulfilled/Rejected |

**Example:**
```javascript
// Callbacks (callback hell)
getUser(id, (err, user) => {
  if (err) return handleError(err);
  getPosts(user.id, (err, posts) => {
    if (err) return handleError(err);
    getComments(posts[0].id, (err, comments) => {
      if (err) return handleError(err);
      console.log(comments);
    });
  });
});

// Promises (cleaner)
getUser(id)
  .then(user => getPosts(user.id))
  .then(posts => getComments(posts[0].id))
  .then(comments => console.log(comments))
  .catch(handleError);

// Async/await (cleanest)
try {
  const user = await getUser(id);
  const posts = await getPosts(user.id);
  const comments = await getComments(posts[0].id);
  console.log(comments);
} catch (err) {
  handleError(err);
}
```

---

### Q9: What is the Difference Between Promise.all() and Promise.allSettled()?

**Standard Answer:**

**Promise.all():**
- Fails fast: If any promise rejects, entire Promise.all() rejects immediately
- Returns array of results if all succeed
- Use when: All promises must succeed

**Promise.allSettled():**
- Waits for all: Waits for all promises to settle (fulfill or reject)
- Returns array of results with status for each
- Use when: You want results from all promises, even if some fail

**Example:**
```javascript
const promises = [
  Promise.resolve('Success 1'),
  Promise.reject('Error'),
  Promise.resolve('Success 2')
];

// Promise.all() - fails fast
Promise.all(promises)
  .then(results => console.log(results))
  .catch(err => console.log('Failed:', err)); // Catches on first rejection

// Promise.allSettled() - waits for all
Promise.allSettled(promises)
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Promise ${index}:`, result.value);
      } else {
        console.log(`Promise ${index}:`, result.reason);
      }
    });
  });
```

---

## Frameworks & APIs

### Q10: Explain Middleware in Express.js

**Standard Answer:**
Middleware are functions that execute during the request-response cycle. They have access to `req`, `res`, and `next`.

**Types:**
1. **Application-level**: `app.use()`
2. **Router-level**: `router.use()`
3. **Error-handling**: 4 parameters `(err, req, res, next)`
4. **Built-in**: `express.json()`, `express.static()`
5. **Third-party**: `cors`, `helmet`, `morgan`

**Execution Order:**
Middleware executes in the order they're defined. Call `next()` to pass control to the next middleware.

**Example:**
```javascript
// Application-level middleware
app.use(express.json()); // Parse JSON bodies
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // Important: pass to next middleware
});

// Route-specific middleware
app.get('/users', authenticate, (req, res) => {
  // authenticate middleware runs first
  res.json(users);
});

// Error-handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

---

### Q11: How Do You Implement Authentication in Node.js?

**Standard Answer:**
Common authentication methods:

1. **JWT (JSON Web Tokens)**: Stateless, token-based
2. **Session-based**: Stateful, server stores session
3. **OAuth 2.0**: Third-party authentication

**JWT Implementation:**
```javascript
const jwt = require('jsonwebtoken');

// Generate token
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verify token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});
```

---

## Database & Performance

### Q12: How Do You Optimize Database Queries?

**Standard Answer:**

1. **Use Indexes**: Create indexes on frequently queried fields
2. **Select Only Needed Fields**: Don't use `SELECT *`
3. **Use Pagination**: Limit results with `LIMIT` and `OFFSET`
4. **Avoid N+1 Queries**: Use joins or populate
5. **Use Connection Pooling**: Reuse database connections
6. **Cache Frequently Accessed Data**: Use Redis or in-memory cache

**Example:**
```javascript
// ❌ Bad: N+1 queries
const posts = await Post.find();
for (const post of posts) {
  post.author = await User.findById(post.authorId); // N queries!
}

// ✅ Good: Single query with populate
const posts = await Post.find().populate('authorId');

// ❌ Bad: Selecting all fields
const users = await User.find();

// ✅ Good: Select only needed fields
const users = await User.find().select('name email');

// ❌ Bad: No pagination
const users = await User.find(); // Could be millions!

// ✅ Good: Pagination
const page = 1;
const limit = 10;
const users = await User.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

---

### Q13: Explain Caching Strategies

**Standard Answer:**
Caching stores frequently accessed data in fast storage to reduce database load and improve response times.

**Types:**
1. **In-Memory Cache**: Fast but lost on restart (NodeCache)
2. **Redis Cache**: Persistent, distributed, fast
3. **CDN Cache**: For static assets
4. **Application Cache**: Cache API responses

**Example:**
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Cache middleware
function cacheMiddleware(duration = 600) {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached) {
      return res.json(cached); // Return cached data
    }
    
    // Override res.json to cache response
    res.originalJson = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.originalJson(body);
    };
    
    next();
  };
}

// Usage
app.get('/users', cacheMiddleware(300), async (req, res) => {
  const users = await User.find();
  res.json(users); // Automatically cached
});
```

---

## Security & Best Practices

### Q14: How Do You Prevent SQL Injection?

**Standard Answer:**
SQL injection occurs when user input is directly concatenated into SQL queries. Prevent it by using parameterized queries.

**Vulnerable Code:**
```javascript
// ❌ Vulnerable to SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`;
// If email = "admin' OR '1'='1", this becomes:
// SELECT * FROM users WHERE email = 'admin' OR '1'='1'
```

**Safe Code:**
```javascript
// ✅ Parameterized queries
const query = 'SELECT * FROM users WHERE email = $1';
await pool.query(query, [email]);

// ✅ ORM handles it automatically
const user = await User.findOne({ where: { email } });
```

---

### Q15: How Do You Handle Errors Properly?

**Standard Answer:**
1. **Use try-catch** for async operations
2. **Handle errors at appropriate levels**
3. **Provide meaningful error messages**
4. **Log errors** for debugging
5. **Don't expose sensitive information** in production

**Example:**
```javascript
// ✅ Proper error handling
async function getUser(id) {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError(`User ${id} not found`);
    }
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error; // Re-throw custom errors
    }
    logger.error('Database error:', error);
    throw new Error('Failed to fetch user');
  }
}

// Express error middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message;
  
  res.status(err.status || 500).json({ error: message });
});
```

---

## Coding Problems

### Problem 1: Implement Debounce Function

**Standard Answer:**
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

// Only executes after 300ms of no calls
debouncedSearch('a');
debouncedSearch('ab');
debouncedSearch('abc'); // Only this executes
```

---

### Problem 2: Implement Throttle Function

**Standard Answer:**
```javascript
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
const throttledScroll = throttle(() => {
  console.log('Scroll event');
}, 100);

// Executes at most once per 100ms
```

---

### Problem 3: Implement Promise.all()

**Standard Answer:**
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

---

### Problem 4: Deep Clone an Object

**Standard Answer:**
```javascript
// Method 1: JSON (limitations: no functions, dates, undefined)
function deepCloneJSON(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Method 2: Recursive (handles all types)
function deepClone(obj, visited = new WeakMap()) {
  // Handle primitives
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle circular references
  if (visited.has(obj)) {
    return visited.get(obj);
  }
  
  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  // Handle Array
  if (Array.isArray(obj)) {
    const cloned = [];
    visited.set(obj, cloned);
    obj.forEach(item => {
      cloned.push(deepClone(item, visited));
    });
    return cloned;
  }
  
  // Handle Object
  const cloned = {};
  visited.set(obj, cloned);
  Object.keys(obj).forEach(key => {
    cloned[key] = deepClone(obj[key], visited);
  });
  return cloned;
}
```

---

### Problem 5: Implement a Simple Cache

**Standard Answer:**
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

This comprehensive guide covers all major interview topics with standard answers, examples, and coding problems. Practice explaining each concept out loud and implement the coding problems from scratch.

