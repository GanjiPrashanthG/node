# Node.js Interview Preparation Guide
## From Basic to Advanced Level

### Table of Contents
1. [Node.js Fundamentals](#1-nodejs-fundamentals)
2. [Event-Driven Architecture](#2-event-driven-architecture)
3. [Asynchronous Programming](#3-asynchronous-programming)
4. [Core Modules & APIs](#4-core-modules--apis)
5. [Frameworks (Express, Nest.js, Koa)](#5-frameworks)
6. [RESTful APIs & Authentication](#6-restful-apis--authentication)
7. [Database Integration](#7-database-integration)
8. [Testing](#8-testing)
9. [Performance Optimization](#9-performance-optimization)
10. [Security](#10-security)
11. [Deployment & DevOps](#11-deployment--devops)
12. [Design Patterns](#12-design-patterns)
13. [Common Interview Questions](#13-common-interview-questions)
14. [System Design for Node.js](#14-system-design-for-nodejs)

### Additional Resources
- **[Modern JavaScript (ES6-ES2023)](./modern-javascript-es6-plus.md)** - Complete guide to modern JavaScript features
- **[Complete Interview Questions](./interview-questions-complete.md)** - Comprehensive Q&A with standard answers
- **[Accenture Interview Guide](./accenture-interview-guide.md)** - Accenture-specific questions and interview experience
- **[Missing JavaScript Concepts](./missing-javascript-concepts.md)** - Getters/Setters, Higher Order Functions, Closures, etc.
- **[SQL & MongoDB Guide](./sql-mongodb-complete-guide.md)** - Complete database guide for Node.js developers
- **[SQL Advanced Concepts](./sql-advanced-concepts.md)** - JOINs, Window Functions, Indexes, Partitioning, Replication, Migrations
- **[SQL Injection Prevention](./sql-injection-security.md)** - Complete security guide with prevention techniques
- **[SOLID Principles](./solid-principles.md)** - Object-oriented design principles for Node.js

---

## 1. Node.js Fundamentals

### What is Node.js?

**Simple Explanation:**
Think of Node.js as a way to run JavaScript on your computer (server-side) instead of just in a web browser. It's like having a JavaScript engine that can access your file system, create web servers, and interact with databases.

**Detailed Explanation:**
- **Runtime Environment**: Node.js is built on Chrome's V8 JavaScript engine. The V8 engine compiles JavaScript directly to machine code, making it very fast. Think of it as a translator that converts JavaScript code into instructions your computer can understand and execute.

- **Event-Driven**: Node.js uses an event loop to handle operations. Instead of waiting for one task to finish before starting another (blocking), it can start multiple tasks and handle them as they complete. Imagine a restaurant waiter who takes multiple orders, starts cooking them, and serves each dish as it's ready, rather than waiting for one order to be completely finished before taking the next.

- **Single-Threaded**: Node.js runs JavaScript in a single main thread, but it's smart about it. For I/O operations (like reading files or making network requests), it doesn't block. However, for CPU-intensive tasks (like complex calculations), it can use worker threads to avoid blocking the main thread. It's like having one chef (main thread) who can delegate heavy cooking tasks to assistants (worker threads) while continuing to manage orders.

- **NPM**: Node Package Manager is like an app store for JavaScript code. It's the largest ecosystem of open-source libraries, allowing you to easily install and use code written by other developers. Instead of writing everything from scratch, you can use pre-built solutions.

### Key Concepts

#### Process vs Thread

**Simple Explanation:**
- **Process**: Like a separate program running on your computer. Each process has its own memory space. Think of it as a completely separate kitchen with its own ingredients and tools.
- **Thread**: Like a worker within a process. Multiple threads can share the same memory space. Think of it as multiple chefs working in the same kitchen, sharing ingredients.

**Why This Matters:**
Node.js runs in a single process, but can create worker threads for heavy computational tasks. This allows it to handle many I/O operations efficiently while still being able to do CPU-intensive work without blocking.

**Example with Explanation:**
```javascript
// Node.js runs in a single process
// Each process has a unique ID
console.log(process.pid); // Process ID - like a unique identifier for this program

// Worker Threads for CPU-intensive tasks
// Think of this as hiring temporary workers for heavy lifting
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  // This is the main thread (the boss)
  // Create a worker thread (hire a worker)
  const worker = new Worker(__filename);
  
  // Listen for messages from the worker
  worker.on('message', (msg) => {
    console.log('From worker:', msg); // Worker says: "Echo: Hello from main"
  });
  
  // Send a message to the worker
  worker.postMessage('Hello from main');
} else {
  // This is the worker thread (the employee)
  // Listen for messages from the main thread
  parentPort.on('message', (msg) => {
    // Echo the message back
    parentPort.postMessage(`Echo: ${msg}`);
  });
}

// Real-world analogy:
// Main thread: "Hey worker, process this large file!"
// Worker: "Sure boss, I'll do it and let you know when done"
// Main thread: "Great, I'll continue handling web requests while you work"
```

#### Global Objects

**Simple Explanation:**
Global objects are like tools that are always available everywhere in your Node.js program, without needing to import them. They're like having a toolbox that's always with you.

**Detailed Explanation:**

- **`global`**: This is the global namespace object, similar to `window` in browsers. Any variable you attach to `global` becomes available everywhere. However, it's generally not recommended to use it directly.

  ```javascript
  // Example (not recommended in practice)
  global.myVariable = 'Hello';
  console.log(myVariable); // Works, but pollutes global scope
  ```

- **`process`**: This object provides information and control over the current Node.js process. It's like a control panel for your application.

  ```javascript
  console.log(process.pid);        // Process ID
  console.log(process.version);    // Node.js version
  console.log(process.env);        // Environment variables
  console.log(process.cwd());      // Current working directory
  ```

- **`Buffer`**: A class for handling binary data. Think of it as a way to work with raw data (like images, files) that isn't text. It's like having a special container for binary data.

  ```javascript
  // Create a buffer from a string
  const buf = Buffer.from('Hello', 'utf8');
  console.log(buf); // <Buffer 48 65 6c 6c 6f>
  console.log(buf.toString()); // 'Hello'
  ```

- **`__dirname`**: The directory name of the current module. It's like knowing which folder your current file is in.

  ```javascript
  // If your file is in /home/user/project/app.js
  console.log(__dirname); // '/home/user/project'
  ```

- **`__filename`**: The filename of the current module. It's like knowing the full path to your current file.

  ```javascript
  // If your file is /home/user/project/app.js
  console.log(__filename); // '/home/user/project/app.js'
  ```

#### Module System

**Simple Explanation:**
Modules are like separate files that contain code you want to reuse. The module system lets you share code between files, like sharing recipes between cookbooks. There are two main systems: CommonJS (Node.js default) and ES6 Modules.

**Why Modules Matter:**
- **Code Organization**: Split your code into logical, reusable pieces
- **Avoid Conflicts**: Each module has its own scope, preventing variable name collisions
- **Reusability**: Write once, use everywhere

**CommonJS (Node.js Default) - Synchronous Loading**

Think of CommonJS like a library where you check out a book (require) and get it immediately.

```javascript
// math.js - Exporting functions
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};

// Or export individually
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// app.js - Importing
const math = require('./math'); // Synchronous - loads immediately
console.log(math.add(2, 3)); // 5

// Or destructure
const { add, subtract } = require('./math');
console.log(add(2, 3)); // 5
```

**ES6 Modules - Modern Standard**

Think of ES6 modules like ordering a book online - it can be asynchronous, and you specify exactly what you want.

```javascript
// math.js - Exporting
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// Or default export
export default {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};

// app.js - Importing (need "type": "module" in package.json)
import { add, subtract } from './math.js'; // Must include .js extension
import math from './math.js'; // Default import

console.log(add(2, 3)); // 5
```

**Key Differences:**

| Feature | CommonJS | ES6 Modules |
|---------|----------|------------|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Can be asynchronous |
| Location | Can be anywhere | Must be at top level |
| Extension | Not required | Required (.js) |
| Default | Node.js default | Need "type": "module" |

**Real-World Example:**

```javascript
// utils/logger.js
module.exports = {
  log: (message) => console.log(`[LOG] ${new Date().toISOString()}: ${message}`),
  error: (message) => console.error(`[ERROR] ${new Date().toISOString()}: ${message}`)
};

// app.js
const logger = require('./utils/logger');
logger.log('Application started'); // [LOG] 2024-01-01T10:00:00.000Z: Application started
```

---

## 2. Event-Driven Architecture

### Event Loop Phases

**Simple Explanation:**
The Event Loop is like a smart waiter in a restaurant who manages multiple tables. Instead of serving one table completely before moving to the next, the waiter takes orders from all tables, starts cooking, and serves dishes as they're ready. The Event Loop has different phases (like different stations in the kitchen) where it handles different types of tasks.

**Why Event Loop Exists:**
JavaScript is single-threaded, meaning it can only do one thing at a time. The Event Loop makes it feel like multiple things are happening simultaneously by quickly switching between tasks. It's like a juggler who can only hold one ball at a time but switches so fast it looks like they're holding multiple balls.

**Detailed Phase Explanation:**

1. **Timers Phase**: 
   - **What it does**: Executes callbacks scheduled by `setTimeout()` and `setInterval()`
   - **Simple analogy**: Like checking your alarm clock - "Is it time to wake up yet?"
   - **Example**: If you set a timeout for 1 second, the Event Loop checks if 1 second has passed and executes the callback

2. **Pending Callbacks Phase**:
   - **What it does**: Executes I/O callbacks that were deferred to the next loop iteration
   - **Simple analogy**: Like handling tasks you postponed from yesterday
   - **Example**: Network errors or file system errors that need to be handled

3. **Idle, Prepare Phase**:
   - **What it does**: Internal use only - Node.js prepares for the next phases
   - **Simple analogy**: Like a chef preparing their station before cooking

4. **Poll Phase**:
   - **What it does**: Fetches new I/O events and executes I/O related callbacks
   - **Simple analogy**: Like checking if new orders have arrived
   - **Example**: Reading files, making database queries, handling HTTP requests
   - **Important**: This is where most of your application code runs

5. **Check Phase**:
   - **What it does**: Executes `setImmediate()` callbacks
   - **Simple analogy**: Like handling priority tasks that should happen right after I/O
   - **Example**: Tasks that need to run immediately after I/O operations complete

6. **Close Callbacks Phase**:
   - **What it does**: Executes close callbacks (e.g., `socket.on('close')`)
   - **Simple analogy**: Like cleaning up after a customer leaves
   - **Example**: Closing database connections, cleaning up resources

**Visual Flow:**
```
Start → Timers → Pending → Idle/Prepare → Poll → Check → Close → (Repeat)
         ↓         ↓          ↓            ↓      ↓       ↓
      setTimeout  Errors   Internal    I/O    setImmediate  Cleanup
```

**Real-World Example:**
```javascript
// Understanding the phases with a simple example
console.log('Start'); // Runs immediately

setTimeout(() => console.log('Timer'), 0); // Timers phase
setImmediate(() => console.log('Immediate')); // Check phase

fs.readFile('file.txt', () => {
  console.log('File read'); // Poll phase
  setTimeout(() => console.log('Timer in callback'), 0);
  setImmediate(() => console.log('Immediate in callback'));
});

console.log('End'); // Runs immediately

// Output order:
// Start
// End
// Timer
// File read
// Immediate in callback
// Timer in callback
```

### Event Emitter Pattern

**Simple Explanation:**
Event Emitter is like a radio station. The station (emitter) broadcasts events, and listeners (subscribers) tune in to hear those events. When something happens (an event is emitted), all listeners who are tuned in get notified.

**Why Use Event Emitters:**
- **Decoupling**: The code that triggers an event doesn't need to know who's listening
- **Flexibility**: Multiple listeners can respond to the same event
- **Asynchronous Communication**: Perfect for handling events that happen at unpredictable times

**Real-World Analogy:**
Think of a doorbell. When someone rings it (emits an event), everyone in the house who's listening (has registered a listener) can respond. The person ringing the bell doesn't need to know who's home - they just ring, and listeners respond.

**Detailed Explanation with Examples:**

```javascript
const EventEmitter = require('events');

// Create a custom emitter class
class MyEmitter extends EventEmitter {}

// Create an instance
const myEmitter = new MyEmitter();

// Listen to event - like subscribing to a newsletter
// This listener will fire every time the event is emitted
myEmitter.on('event', (data) => {
  console.log('Event received:', data);
});

// Emit event - like publishing a newsletter
// All listeners will be notified
myEmitter.emit('event', { message: 'Hello' });
// Output: Event received: { message: 'Hello' }

// You can have multiple listeners for the same event
myEmitter.on('event', (data) => {
  console.log('Second listener:', data);
});

myEmitter.emit('event', { message: 'Hello again' });
// Output:
// Event received: { message: 'Hello again' }
// Second listener: { message: 'Hello again' }

// Once - listen only once, then automatically unsubscribe
// Like a one-time notification
myEmitter.once('event', () => {
  console.log('This will only fire once');
});

myEmitter.emit('event', {}); // Fires
myEmitter.emit('event', {}); // Doesn't fire (already removed)

// Error handling - special event name
// If an error event is emitted and no listener exists, Node.js will crash
myEmitter.on('error', (err) => {
  console.error('Error occurred:', err);
});

myEmitter.emit('error', new Error('Something went wrong'));
// Output: Error occurred: Error: Something went wrong
```

**Practical Example: User Login System**

```javascript
class UserService extends EventEmitter {
  login(email, password) {
    // Simulate login process
    if (email && password) {
      this.emit('login-success', { email, timestamp: new Date() });
    } else {
      this.emit('login-failure', { email, reason: 'Invalid credentials' });
    }
  }
}

const userService = new UserService();

// Different parts of your app can listen to the same events
// Analytics service
userService.on('login-success', (data) => {
  console.log('Analytics: User logged in', data.email);
});

// Email service
userService.on('login-success', (data) => {
  console.log('Email: Sending welcome email to', data.email);
});

// Security service
userService.on('login-failure', (data) => {
  console.log('Security: Failed login attempt for', data.email);
});

// Trigger the event
userService.login('user@example.com', 'password123');
// Output:
// Analytics: User logged in user@example.com
// Email: Sending welcome email to user@example.com
```

**Key Methods:**
- `on(event, listener)`: Subscribe to an event (listens every time)
- `once(event, listener)`: Subscribe to an event once (auto-removes after first emission)
- `emit(event, ...args)`: Trigger an event (notify all listeners)
- `removeListener(event, listener)`: Unsubscribe from an event
- `removeAllListeners(event)`: Remove all listeners for an event

### Streams

**Simple Explanation:**
Streams are like water flowing through a pipe. Instead of waiting for all the water to fill a bucket before using it, you can use the water as it flows. In programming, streams let you process data piece by piece as it arrives, rather than loading everything into memory at once.

**Why Streams Matter:**
- **Memory Efficient**: Process large files without loading everything into memory
- **Time Efficient**: Start processing data before all of it has arrived
- **Composable**: Chain multiple streams together like pipes

**Real-World Analogy:**
Imagine downloading a 10GB movie. Without streams, you'd wait for the entire file to download before watching. With streams, you can start watching as soon as enough data has downloaded (like video streaming services do).

**Types of Streams:**

1. **Readable Stream**: Data flows out (like a water source)
2. **Writable Stream**: Data flows in (like a drain)
3. **Duplex Stream**: Data flows both ways (like a phone line)
4. **Transform Stream**: Data flows through and gets modified (like a water filter)

**Basic Example - Copying a File:**

```javascript
const fs = require('fs');

// Readable Stream - reads data from a file
const readable = fs.createReadStream('input.txt');

// Writable Stream - writes data to a file
const writable = fs.createWriteStream('output.txt');

// Pipe connects them - like connecting a hose from source to destination
// Data flows automatically from readable to writable
readable.pipe(writable);

// This is equivalent to:
// readable.on('data', (chunk) => {
//   writable.write(chunk);
// });
// readable.on('end', () => {
//   writable.end();
// });
```

**Transform Stream - Modifying Data:**

```javascript
const { Transform } = require('stream');

// Transform stream - like a filter that modifies data as it passes through
const transform = new Transform({
  transform(chunk, encoding, callback) {
    // chunk is a piece of data (Buffer)
    // Convert to string, make uppercase, push it forward
    this.push(chunk.toString().toUpperCase());
    callback(); // Signal that this chunk is processed
  }
});

// Chain streams together: read → transform → write
readable.pipe(transform).pipe(writable);

// Example flow:
// input.txt: "hello world"
// transform: "HELLO WORLD"
// output.txt: "HELLO WORLD"
```

**Custom Readable Stream - Generating Data:**

```javascript
const { Readable } = require('stream');

// Create a stream that generates numbers
class NumberStream extends Readable {
  constructor(options) {
    super(options);
    this.index = 0;
    this.max = 10;
  }
  
  // _read() is called when the stream wants more data
  _read() {
    if (this.index < this.max) {
      // Push data to the stream
      this.push(String(this.index++));
    } else {
      // Push null to signal end of stream
      this.push(null);
    }
  }
}

const numbers = new NumberStream();
numbers.on('data', (chunk) => {
  console.log('Received:', chunk.toString()); // 0, 1, 2, 3, ...
});
```

**Practical Example - Processing Large CSV File:**

```javascript
const fs = require('fs');
const { Transform } = require('stream');

// Read large CSV file
const readable = fs.createReadStream('large-file.csv');

// Transform: Parse CSV and extract specific columns
const csvParser = new Transform({
  objectMode: true, // Work with objects instead of buffers
  transform(chunk, encoding, callback) {
    const line = chunk.toString();
    const [name, email, age] = line.split(',');
    
    // Only process adults
    if (parseInt(age) >= 18) {
      this.push(JSON.stringify({ name, email, age }) + '\n');
    }
    callback();
  }
});

// Write filtered results
const writable = fs.createWriteStream('adults-only.json');

readable.pipe(csvParser).pipe(writable);

// Memory efficient: Processes line by line, not loading entire file
```

**Key Concepts:**

- **Chunk**: A piece of data in the stream (usually a Buffer)
- **Pipe**: Connects streams together, automatically handling data flow
- **Backpressure**: When writable stream is full, readable stream pauses automatically
- **Object Mode**: Streams can work with JavaScript objects instead of just buffers

---

## 3. Asynchronous Programming

**Simple Explanation:**
Asynchronous programming is like ordering food at a restaurant. You place your order (start a task), and while the kitchen prepares it (task is processing), you can do other things like chat with friends (handle other requests). When your food is ready (task completes), the waiter brings it to you (callback is executed).

**Why Asynchronous?**
- **Non-Blocking**: Don't wait for slow operations (like reading files or making network requests)
- **Efficiency**: Handle multiple operations simultaneously
- **Better User Experience**: Your application stays responsive

**Synchronous vs Asynchronous:**

```javascript
// Synchronous (Blocking) - Like waiting in line
console.log('1. Start');
const data = fs.readFileSync('file.txt'); // Waits here until file is read
console.log('2. File read');
console.log('3. End');
// Output: 1, 2, 3 (in order, waiting for each step)

// Asynchronous (Non-Blocking) - Like ordering and continuing
console.log('1. Start');
fs.readFile('file.txt', (err, data) => {
  console.log('2. File read');
});
console.log('3. End');
// Output: 1, 3, 2 (3 doesn't wait for file reading)
```

### Callbacks

**Simple Explanation:**
A callback is a function that gets called when an operation completes. It's like leaving your phone number with a restaurant - they'll call you when your table is ready.

**Basic Callback Pattern:**

```javascript
// Simple callback example
function greet(name, callback) {
  console.log(`Hello, ${name}!`);
  callback(); // Call the callback function
}

greet('John', () => {
  console.log('Greeting completed');
});
// Output:
// Hello, John!
// Greeting completed
```

**Node.js Error-First Callback Pattern:**

In Node.js, callbacks follow a convention: the first parameter is always an error (or null if no error), and the second parameter is the result.

```javascript
// Standard Node.js callback pattern
fs.readFile('file.txt', 'utf8', (err, data) => {
  // Error-first pattern: check error first
  if (err) {
    console.error('Error:', err);
    return; // Exit early if error
  }
  
  // Process data if no error
  console.log('File content:', data);
});
```

**Callback Hell (Anti-pattern):**

When you have multiple asynchronous operations that depend on each other, callbacks can nest deeply, creating "callback hell" or "pyramid of doom."

```javascript
// Callback Hell - Hard to read and maintain
fs.readFile('file1.txt', (err, data1) => {
  if (err) throw err;
  fs.readFile('file2.txt', (err, data2) => {
    if (err) throw err;
    fs.readFile('file3.txt', (err, data3) => {
      if (err) throw err;
      fs.writeFile('output.txt', data1 + data2 + data3, (err) => {
        if (err) throw err;
        console.log('Done'); // 4 levels deep!
      });
    });
  });
});
```

**Why Callback Hell is Bad:**
- Hard to read and understand
- Difficult to maintain
- Error handling becomes complex
- Difficult to debug

**Solution: Use Promises or Async/Await (see below)**

### Promises

**Simple Explanation:**
A Promise is like a receipt for a future value. When you order food, you get a receipt (Promise) that says "your food will be ready soon." You can do other things while waiting, and when the food is ready (Promise resolves), you get it. If something goes wrong (Promise rejects), you're notified.

**Why Promises?**
- **Better than Callbacks**: Avoid callback hell, easier to read
- **Chainable**: Can chain multiple operations together
- **Error Handling**: Single `.catch()` for all errors in the chain
- **Parallel Execution**: Can run multiple promises simultaneously

**Promise States:**
1. **Pending**: Waiting for result (like waiting for food)
2. **Fulfilled**: Successfully completed (food is ready)
3. **Rejected**: Failed (order was cancelled)

**Basic Promise Example:**

```javascript
// Creating a Promise
const myPromise = new Promise((resolve, reject) => {
  // Simulate async operation
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('Operation successful!'); // Promise fulfilled
    } else {
      reject('Operation failed!'); // Promise rejected
    }
  }, 1000);
});

// Using the Promise
myPromise
  .then(result => console.log(result)) // Handles success
  .catch(error => console.error(error)); // Handles failure
```

**Promise Chain - Sequential Operations:**

```javascript
const fs = require('fs').promises;

// Sequential: Read file1, then file2, then write
// Each .then() receives the result from previous step
fs.readFile('file1.txt', 'utf8')
  .then(data1 => {
    console.log('File1 read:', data1);
    return fs.readFile('file2.txt', 'utf8'); // Return next promise
  })
  .then(data2 => {
    console.log('File2 read:', data2);
    return fs.writeFile('output.txt', data1 + data2); // Note: data1 not available here!
  })
  .then(() => console.log('Done'))
  .catch(err => console.error('Error:', err)); // Catches any error in the chain

// Problem: data1 is not available in second .then()
// Solution: Keep data in scope or use async/await
```

**Promise.all - Parallel Execution:**

When you need to do multiple independent operations at the same time, use `Promise.all()`. It's like ordering multiple dishes - they cook in parallel, and you wait for all of them.

```javascript
// Parallel: Read both files at the same time
Promise.all([
  fs.readFile('file1.txt', 'utf8'),
  fs.readFile('file2.txt', 'utf8')
])
  .then(([data1, data2]) => {
    // Both files are read, results are in an array
    console.log('Both files read');
    return fs.writeFile('output.txt', data1 + data2);
  })
  .catch(err => console.error('Error:', err));

// Benefits:
// - Faster: Both files read simultaneously
// - Fails fast: If any promise rejects, entire Promise.all() rejects
```

**Promise.allSettled - Wait for All, Even Failures:**

Unlike `Promise.all()`, `Promise.allSettled()` waits for all promises to complete, even if some fail. It's like checking all your orders - you want to know which succeeded and which failed.

```javascript
Promise.allSettled([
  fs.readFile('file1.txt', 'utf8'),
  fs.readFile('nonexistent.txt', 'utf8'), // This will fail
  fs.readFile('file3.txt', 'utf8')
])
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`File ${index} read successfully:`, result.value);
      } else {
        console.log(`File ${index} failed:`, result.reason);
      }
    });
  });

// Output:
// File 0 read successfully: <content>
// File 1 failed: Error: ENOENT...
// File 2 read successfully: <content>
```

**Promise.race - First to Complete:**

Gets the result of whichever promise completes first. Like ordering from multiple restaurants and taking whichever arrives first.

```javascript
Promise.race([
  fetch('slow-api.com'),
  fetch('fast-api.com')
])
  .then(result => {
    console.log('Fastest response:', result);
  });
```

**Real-World Example - User Registration:**

```javascript
function registerUser(userData) {
  return validateUser(userData)
    .then(() => checkEmailExists(userData.email))
    .then(exists => {
      if (exists) throw new Error('Email already exists');
      return hashPassword(userData.password);
    })
    .then(hashedPassword => {
      return createUser({ ...userData, password: hashedPassword });
    })
    .then(user => sendWelcomeEmail(user))
    .catch(error => {
      console.error('Registration failed:', error);
      throw error;
    });
}
```

### Async/Await

**Simple Explanation:**
Async/await is like having a personal assistant. You tell them "wait for this task to complete, then do the next thing" (await), and they handle all the waiting for you. Your code looks synchronous (easy to read), but it's actually asynchronous (non-blocking) under the hood.

**Why Async/Await?**
- **Readable**: Looks like synchronous code, easier to understand
- **Error Handling**: Use try/catch like normal code
- **Debugging**: Easier to debug than promise chains
- **Modern**: Preferred way to write async code in Node.js

**Basic Syntax:**

```javascript
// async function always returns a Promise
async function myFunction() {
  // await pauses execution until Promise resolves
  const result = await someAsyncOperation();
  return result;
}

// Using it
myFunction()
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

**Sequential Execution - One After Another:**

```javascript
async function processFiles() {
  try {
    // Wait for file1 to be read, then continue
    const data1 = await fs.readFile('file1.txt', 'utf8');
    console.log('File1 read');
    
    // Wait for file2 to be read, then continue
    const data2 = await fs.readFile('file2.txt', 'utf8');
    console.log('File2 read');
    
    // Wait for file to be written
    await fs.writeFile('output.txt', data1 + data2);
    console.log('Done');
  } catch (err) {
    // Single catch block handles all errors
    console.error('Error:', err);
  }
}

// Execution order:
// 1. Read file1 (wait)
// 2. Read file2 (wait)
// 3. Write output (wait)
// 4. Done
```

**Parallel Execution - At the Same Time:**

```javascript
async function processFilesParallel() {
  try {
    // Start both reads at the same time, wait for both
    const [data1, data2] = await Promise.all([
      fs.readFile('file1.txt', 'utf8'),
      fs.readFile('file2.txt', 'utf8')
    ]);
    
    // Both files are now read
    await fs.writeFile('output.txt', data1 + data2);
    console.log('Done');
  } catch (err) {
    console.error('Error:', err);
  }
}

// Execution order:
// 1. Start reading file1 and file2 simultaneously
// 2. Wait for both to complete
// 3. Write output
// 4. Done
// Much faster than sequential!
```

**Error Handling Patterns:**

```javascript
// Pattern 1: Try-Catch (Recommended)
async function withTryCatch() {
  try {
    const data = await fs.readFile('file.txt', 'utf8');
    return data;
  } catch (err) {
    console.error('Error:', err);
    throw err; // Re-throw if needed
  }
}

// Pattern 2: Catch on Promise
async function withPromiseCatch() {
  const data = await fs.readFile('file.txt', 'utf8')
    .catch(err => {
      console.error('Read failed:', err);
      return 'default content'; // Return fallback value
    });
  return data;
}

// Pattern 3: Handle errors individually
async function handleErrorsIndividually() {
  let data1, data2;
  
  try {
    data1 = await fs.readFile('file1.txt', 'utf8');
  } catch (err) {
    console.error('File1 error:', err);
    data1 = 'default1';
  }
  
  try {
    data2 = await fs.readFile('file2.txt', 'utf8');
  } catch (err) {
    console.error('File2 error:', err);
    data2 = 'default2';
  }
  
  return { data1, data2 };
}
```

**Real-World Example - User Authentication:**

```javascript
async function loginUser(email, password) {
  try {
    // 1. Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    
    // 2. Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid password');
    }
    
    // 3. Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 4. Update last login (don't wait for this)
    User.updateOne({ _id: user.id }, { lastLogin: new Date() })
      .catch(err => console.error('Failed to update last login:', err));
    
    return { token, user };
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
}

// Usage
loginUser('user@example.com', 'password123')
  .then(result => console.log('Login successful:', result))
  .catch(error => console.error('Login failed:', error));
```

**Common Mistakes:**

```javascript
// ❌ Wrong: Not using await
async function wrong() {
  const data = fs.readFile('file.txt'); // Returns Promise, not data!
  console.log(data); // [object Promise]
}

// ✅ Correct: Using await
async function correct() {
  const data = await fs.readFile('file.txt', 'utf8');
  console.log(data); // Actual file content
}

// ❌ Wrong: Sequential when parallel would be better
async function slow() {
  const data1 = await fetch('api1.com'); // Wait
  const data2 = await fetch('api2.com'); // Wait (could be parallel!)
}

// ✅ Correct: Parallel execution
async function fast() {
  const [data1, data2] = await Promise.all([
    fetch('api1.com'),
    fetch('api2.com')
  ]); // Both fetch simultaneously
}
```

### Event Loop & Microtasks
```javascript
// Execution order
console.log('1');

setTimeout(() => console.log('2'), 0);
setImmediate(() => console.log('3'));

Promise.resolve().then(() => console.log('4'));

process.nextTick(() => console.log('5'));

console.log('6');

// Output: 1, 6, 5, 4, 2, 3
// nextTick > Promise > setTimeout > setImmediate
```

---

## 4. Core Modules & APIs

### File System
```javascript
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// Synchronous (blocking)
const data = fs.readFileSync('file.txt', 'utf8');

// Asynchronous (non-blocking)
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Promise-based
async function readFile() {
  const data = await fsPromises.readFile('file.txt', 'utf8');
  return data;
}

// Working with paths
const filePath = path.join(__dirname, 'data', 'file.txt');
const ext = path.extname(filePath); // .txt
const basename = path.basename(filePath); // file.txt
```

### HTTP/HTTPS
```javascript
const http = require('http');
const https = require('https');

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello World' }));
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Make HTTP request
const options = {
  hostname: 'api.example.com',
  port: 443,
  path: '/users',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
});

req.on('error', (err) => {
  console.error('Error:', err);
});

req.end();
```

### Cluster Module
```javascript
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
} else {
  // Workers share the same port
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Hello from worker ${process.pid}`);
  }).listen(8000);
  
  console.log(`Worker ${process.pid} started`);
}
```

### Child Process
```javascript
const { spawn, exec, execFile, fork } = require('child_process');

// spawn - for long-running processes with streaming
const ls = spawn('ls', ['-la']);
ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});
ls.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});

// exec - for short commands, returns buffer
exec('ls -la', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

// fork - spawn Node.js processes
const child = fork('child.js');
child.send({ message: 'Hello from parent' });
child.on('message', (msg) => {
  console.log('Message from child:', msg);
});
```

---

## 5. Frameworks

### Express.js

**Simple Explanation:**
Express.js is like a restaurant manager that organizes how your server handles requests. When a customer (client) makes a request, Express routes it to the right handler (like routing orders to the right kitchen station), applies middleware (like checking if the customer has a reservation), and sends back a response (like serving the meal).

**Why Express.js?**
- **Minimalist**: Simple and flexible
- **Middleware**: Powerful plugin system
- **Routing**: Easy URL handling
- **Popular**: Most used Node.js framework
- **Mature**: Well-tested and stable

**Basic Server Setup:**

```javascript
const express = require('express');
const app = express();

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
  // Server is now listening for requests on port 3000
});
```

**Understanding Middleware:**

Middleware are functions that run between receiving a request and sending a response. Think of them as checkpoints or processing stations.

```javascript
// Middleware executes in order
app.use(express.json()); // 1. Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // 2. Parse URL-encoded bodies
app.use(express.static('public')); // 3. Serve static files from 'public' folder

// Custom middleware - runs for every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next(); // Important: call next() to continue to next middleware
});

// Error handling middleware - must have 4 parameters (err, req, res, next)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

**Understanding Routes:**

Routes define what happens when a specific URL is accessed with a specific HTTP method.

```javascript
// GET request to /users/:id
// :id is a route parameter (like a variable in the URL)
app.get('/users/:id', (req, res) => {
  const { id } = req.params; // Extract parameter from URL
  // Example: GET /users/123 → id = "123"
  res.json({ userId: id });
});

// POST request to /users
// Data comes in req.body (parsed by express.json() middleware)
app.post('/users', (req, res) => {
  const user = req.body; // { name: "John", email: "john@example.com" }
  // Save user to database...
  res.status(201).json({ message: 'User created', user });
});

// PUT - Update entire resource
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  // Update user...
  res.json({ message: 'User updated', id, updates });
});

// DELETE - Remove resource
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  // Delete user...
  res.status(204).send(); // 204 = No Content
});
```

**Router - Organizing Routes:**

When you have many routes, organize them using routers. Like organizing menu items by category.

```javascript
const express = require('express');
const router = express.Router();

// Define routes on the router
router.get('/profile', (req, res) => {
  res.json({ profile: 'data' });
});

router.get('/settings', (req, res) => {
  res.json({ settings: 'data' });
});

// Mount router at a path
app.use('/api/users', router);
// Now routes are:
// GET /api/users/profile
// GET /api/users/settings
```

**Complete Example - User API:**

```javascript
const express = require('express');
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// GET /users - List all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id - Get single user
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users - Create user
app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**Request and Response Objects:**

```javascript
app.get('/example', (req, res) => {
  // Request object contains:
  console.log(req.method);    // HTTP method: 'GET', 'POST', etc.
  console.log(req.path);      // URL path: '/example'
  console.log(req.query);     // Query parameters: ?name=John → { name: 'John' }
  console.log(req.params);    // Route parameters: /users/:id → { id: '123' }
  console.log(req.body);      // Request body (for POST/PUT)
  console.log(req.headers);   // HTTP headers
  
  // Response object methods:
  res.status(200);            // Set status code
  res.json({ data: 'value' }); // Send JSON response
  res.send('Hello');          // Send text response
  res.sendFile('/path/to/file'); // Send file
  res.redirect('/other-path');   // Redirect
  res.setHeader('X-Custom', 'value'); // Set header
});
```

### Nest.js (TypeScript Framework)
```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

// app.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}

// users.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

### Koa.js
```javascript
const Koa = require('koa');
const Router = require('@koa/router');
const app = new Koa();
const router = new Router();

// Middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// Routes
router.get('/users/:id', async (ctx) => {
  ctx.body = { userId: ctx.params.id };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
```

---

## 6. RESTful APIs & Authentication

### RESTful API Design
```javascript
// RESTful principles
// GET    /users        - List all users
// GET    /users/:id     - Get user by ID
// POST   /users         - Create new user
// PUT    /users/:id     - Update entire user
// PATCH  /users/:id     - Partial update
// DELETE /users/:id     - Delete user

const express = require('express');
const router = express.Router();

router.get('/users', async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Filtering
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  
  // Sorting
  const sort = req.query.sort || '-createdAt';
  
  const users = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort);
  
  res.json({
    data: users,
    pagination: {
      page,
      limit,
      total: await User.countDocuments(filter)
    }
  });
});
```

### JWT Authentication
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Generate token
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, email: user.email } });
});

// Middleware to verify token
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

### OAuth 2.0 with Passport.js
```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName
    });
  }
  
  return done(null, user);
}));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);
```

---

## 7. Database Integration

### MongoDB with Mongoose
```javascript
const mongoose = require('mongoose');

// Connection
mongoose.connect('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ name: 'text' }); // Text search

// Virtuals
userSchema.virtual('fullName').get(function() {
  return `${this.name} (${this.email})`;
});

// Methods
userSchema.methods.getInfo = function() {
  return `User: ${this.name}, Email: ${this.email}`;
};

// Statics
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

// Middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const User = mongoose.model('User', userSchema);

// CRUD Operations
async function crudOperations() {
  // Create
  const user = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  });
  
  // Read
  const users = await User.find({ age: { $gte: 18 } });
  const user = await User.findById(userId);
  const user = await User.findOne({ email: 'john@example.com' });
  
  // Update
  await User.findByIdAndUpdate(userId, { age: 31 });
  await User.updateMany({ age: { $lt: 18 } }, { status: 'minor' });
  
  // Delete
  await User.findByIdAndDelete(userId);
  await User.deleteMany({ status: 'inactive' });
  
  // Aggregation
  const stats = await User.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
}
```

### PostgreSQL with Sequelize
```javascript
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres'
});

// Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Associations
const Post = sequelize.define('Post', {
  title: DataTypes.STRING,
  content: DataTypes.TEXT
});

User.hasMany(Post);
Post.belongsTo(User);

// CRUD
async function crudOperations() {
  // Create
  const user = await User.create({
    name: 'John Doe',
    email: 'john@example.com'
  });
  
  // Read
  const users = await User.findAll();
  const user = await User.findByPk(userId);
  const user = await User.findOne({ where: { email: 'john@example.com' } });
  
  // Update
  await user.update({ name: 'Jane Doe' });
  await User.update(
    { status: 'active' },
    { where: { status: 'inactive' } }
  );
  
  // Delete
  await user.destroy();
  await User.destroy({ where: { status: 'inactive' } });
  
  // Transactions
  await sequelize.transaction(async (t) => {
    const user = await User.create({ name: 'John' }, { transaction: t });
    await Post.create({ title: 'Post', userId: user.id }, { transaction: t });
  });
}
```

### TypeORM
```typescript
import { Entity, PrimaryGeneratedColumn, Column, Repository } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  name: string;
  
  @Column({ unique: true })
  email: string;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

// Usage
const userRepository = connection.getRepository(User);
const user = await userRepository.findOne({ where: { id: 1 } });
```

---

## 8. Testing

### Jest
```javascript
// math.test.js
const { add, subtract, multiply } = require('./math');

describe('Math functions', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(add(1, 2)).toBe(3);
  });
  
  test('subtracts 5 - 2 to equal 3', () => {
    expect(subtract(5, 2)).toBe(3);
  });
  
  describe('Edge cases', () => {
    test('handles negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
    });
  });
});

// Async testing
describe('Async operations', () => {
  test('fetches user data', async () => {
    const user = await fetchUser(1);
    expect(user).toHaveProperty('id');
    expect(user.id).toBe(1);
  });
  
  test('handles errors', async () => {
    await expect(fetchUser(999)).rejects.toThrow('User not found');
  });
});

// Mocking
jest.mock('./api');
const api = require('./api');

test('calls API correctly', async () => {
  api.fetchData.mockResolvedValue({ data: 'test' });
  const result = await fetchData();
  expect(api.fetchData).toHaveBeenCalledTimes(1);
  expect(result).toEqual({ data: 'test' });
});
```

### Integration Testing
```javascript
const request = require('supertest');
const app = require('./app');

describe('User API', () => {
  test('GET /users returns list of users', async () => {
    const response = await request(app)
      .get('/users')
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  test('POST /users creates new user', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    const response = await request(app)
      .post('/users')
      .send(newUser)
      .expect(201);
    
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(newUser.email);
  });
});
```

### Mocha & Chai
```javascript
const { expect } = require('chai');
const { describe, it, before, after, beforeEach } = require('mocha');

describe('User Service', () => {
  before(() => {
    // Setup before all tests
  });
  
  after(() => {
    // Cleanup after all tests
  });
  
  beforeEach(() => {
    // Setup before each test
  });
  
  it('should create a user', async () => {
    const user = await userService.create({ name: 'John', email: 'john@example.com' });
    expect(user).to.have.property('id');
    expect(user.email).to.equal('john@example.com');
  });
});
```

---

## 9. Performance Optimization

### Caching Strategies
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Cache middleware
function cacheMiddleware(duration) {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.sendResponse(body);
    };
    
    next();
  };
}

// Redis caching
const redis = require('redis');
const client = redis.createClient();

async function getCachedData(key) {
  const cached = await client.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await fetchDataFromDB();
  await client.setex(key, 3600, JSON.stringify(data)); // 1 hour
  return data;
}
```

### Connection Pooling
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  user: 'user',
  password: 'password',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

async function queryDatabase() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows;
  } finally {
    client.release(); // Important: release connection
  }
}
```

### Compression
```javascript
const compression = require('compression');
const express = require('express');
const app = express();

app.use(compression()); // Enable gzip compression
```

### Load Balancing
```javascript
// Using PM2 for process management
// pm2 start app.js -i 4 (4 instances)

// Using cluster module (see section 4)
```

### Database Query Optimization
```javascript
// Use indexes
userSchema.index({ email: 1, status: 1 }); // Compound index

// Select only needed fields
const users = await User.find({}).select('name email'); // Only name and email

// Use lean() for read-only operations (Mongoose)
const users = await User.find({}).lean(); // Returns plain objects, faster

// Pagination
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;
const users = await User.find({}).skip(skip).limit(limit);

// Batch operations
await User.insertMany(usersArray); // Instead of multiple create()
await User.bulkWrite([
  { updateOne: { filter: { id: 1 }, update: { $set: { status: 'active' } } } }
]);
```

---

## 10. Security

### Input Validation
```javascript
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

### SQL Injection Prevention
```javascript
// ❌ Vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Safe - Parameterized queries
const query = 'SELECT * FROM users WHERE email = $1';
await pool.query(query, [email]);

// ✅ Safe - ORM handles it
const user = await User.findOne({ where: { email } });
```

### XSS Prevention
```javascript
const helmet = require('helmet');
app.use(helmet()); // Sets various HTTP headers for security

// Sanitize user input
const sanitize = require('mongo-sanitize');
const cleanInput = sanitize(req.body.input);
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### HTTPS & Security Headers
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
};

https.createServer(options, app).listen(443);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### Password Hashing
```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Hash password
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

---

## 11. Deployment & DevOps

### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Kubernetes
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nodejs-app
  template:
    metadata:
      labels:
        app: nodejs-app
    spec:
      containers:
      - name: nodejs
        image: nodejs-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: nodejs-service
spec:
  selector:
    app: nodejs-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Environment Variables
```javascript
// Use dotenv for local development
require('dotenv').config();

// Access environment variables
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;

// .env file (never commit this)
// PORT=3000
// DATABASE_URL=postgresql://localhost/mydb
// JWT_SECRET=your-secret-key
```

### Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Usage
logger.info('User logged in', { userId: 123 });
logger.error('Database connection failed', { error: err.message });
```

### Monitoring
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Metrics with Prometheus
const client = require('prom-client');
const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      { method: req.method, route: req.route?.path, status_code: res.statusCode },
      duration
    );
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## 12. Design Patterns

### Singleton Pattern
```javascript
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    this.connection = null;
    DatabaseConnection.instance = this;
  }
  
  connect() {
    if (!this.connection) {
      this.connection = createConnection();
    }
    return this.connection;
  }
}

// Usage
const db1 = new DatabaseConnection();
const db2 = new DatabaseConnection();
console.log(db1 === db2); // true
```

### Factory Pattern
```javascript
class UserFactory {
  static create(type, data) {
    switch (type) {
      case 'admin':
        return new AdminUser(data);
      case 'regular':
        return new RegularUser(data);
      default:
        throw new Error('Unknown user type');
    }
  }
}

const admin = UserFactory.create('admin', { name: 'John' });
```

### Observer Pattern
```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}
```

### Middleware Pattern
```javascript
class Middleware {
  constructor() {
    this.middlewares = [];
  }
  
  use(fn) {
    this.middlewares.push(fn);
  }
  
  execute(context) {
    let index = 0;
    
    const next = () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        middleware(context, next);
      }
    };
    
    next();
  }
}

// Usage
const middleware = new Middleware();
middleware.use((ctx, next) => {
  console.log('Middleware 1');
  next();
});
middleware.use((ctx, next) => {
  console.log('Middleware 2');
  next();
});
```

### Repository Pattern
```javascript
class UserRepository {
  constructor(db) {
    this.db = db;
  }
  
  async findById(id) {
    return await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
  }
  
  async create(userData) {
    return await this.db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [userData.name, userData.email]
    );
  }
  
  async update(id, userData) {
    return await this.db.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [userData.name, userData.email, id]
    );
  }
  
  async delete(id) {
    return await this.db.query('DELETE FROM users WHERE id = $1', [id]);
  }
}
```

---

## 13. Common Interview Questions

### Basic Level

**Q1: What is Node.js and how does it work?**
- Node.js is a JavaScript runtime built on Chrome's V8 engine
- Uses event-driven, non-blocking I/O model
- Single-threaded event loop handles all operations
- Suitable for I/O-intensive applications

**Q2: What is the difference between Node.js and JavaScript?**
- JavaScript is a programming language
- Node.js is a runtime environment that executes JavaScript outside the browser
- Node.js provides APIs for file system, HTTP, etc. that aren't available in browsers

**Q3: Explain the event loop.**
- Event loop is the core of Node.js
- Handles asynchronous operations
- Phases: Timers → Pending callbacks → Idle → Poll → Check → Close callbacks
- Uses callbacks, promises, and async/await for asynchronous operations

**Q4: What is the difference between `setImmediate()` and `setTimeout()`?**
- `setTimeout()` schedules callback after specified delay
- `setImmediate()` schedules callback to execute in the next iteration of the event loop
- In I/O cycle, `setImmediate()` executes before `setTimeout()`

**Q5: What are streams in Node.js?**
- Streams are objects that let you read/write data continuously
- Types: Readable, Writable, Duplex, Transform
- Memory efficient for large data processing
- Examples: File streams, HTTP requests/responses

### Intermediate Level

**Q6: Explain the difference between `process.nextTick()` and `setImmediate()`.**
```javascript
// process.nextTick() has higher priority
process.nextTick(() => console.log('nextTick'));
setImmediate(() => console.log('setImmediate'));
// Output: nextTick, setImmediate
```

**Q7: How do you handle errors in Node.js?**
```javascript
// Try-catch for synchronous code
try {
  const data = fs.readFileSync('file.txt');
} catch (err) {
  console.error(err);
}

// Callbacks - error first pattern
fs.readFile('file.txt', (err, data) => {
  if (err) {
    return console.error(err);
  }
  // Process data
});

// Promises
fs.promises.readFile('file.txt')
  .then(data => {})
  .catch(err => console.error(err));

// Async/await
try {
  const data = await fs.promises.readFile('file.txt');
} catch (err) {
  console.error(err);
}

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
```

**Q8: What is the difference between `require()` and `import()`?**
- `require()` is CommonJS (synchronous, used in Node.js by default)
- `import()` is ES6 modules (asynchronous, can be used with "type": "module")
- `require()` can be used anywhere, `import()` must be at top level
- `require()` returns the module.exports object
- `import()` returns a promise for dynamic imports

**Q9: How do you scale Node.js applications?**
- **Horizontal scaling**: Multiple instances using cluster module or PM2
- **Load balancing**: Nginx, HAProxy, or cloud load balancers
- **Caching**: Redis, Memcached for session and data caching
- **Database optimization**: Connection pooling, query optimization, read replicas
- **Microservices**: Split application into smaller services

**Q10: Explain middleware in Express.js.**
- Middleware functions have access to request, response, and next
- Can execute code, modify request/response, end request-response cycle, call next middleware
- Types: Application-level, Router-level, Error-handling, Built-in, Third-party

### Advanced Level

**Q11: How do you implement rate limiting?**
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const client = redis.createClient();

const limiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rl:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
```

**Q12: Explain memory leaks in Node.js and how to prevent them.**
- **Common causes**: 
  - Global variables
  - Closures holding references
  - Event listeners not removed
  - Timers not cleared
- **Prevention**:
  - Use `weakMap` and `weakSet`
  - Remove event listeners
  - Clear intervals/timeouts
  - Use tools like `clinic.js`, `node-memwatch`

**Q13: How do you handle file uploads?**
```javascript
const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file });
});
```

**Q14: Explain the difference between `exec()`, `spawn()`, and `fork()`.**
- `exec()`: Spawns shell, buffers output, returns all output at once
- `spawn()`: Spawns process, streams output, better for long-running processes
- `fork()`: Special case of `spawn()` for Node.js processes, creates IPC channel

**Q15: How do you implement WebSockets?**
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
```

**Q16: Explain microservices architecture with Node.js.**
- Split application into independent services
- Each service has its own database
- Communication via REST APIs or message queues (RabbitMQ, Kafka)
- Service discovery, API gateway, containerization

**Q17: How do you implement GraphQL in Node.js?**
```javascript
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }
  
  type Query {
    users: [User]
    user(id: ID!): User
  }
  
  type Mutation {
    createUser(name: String!, email: String!): User
  }
`;

const resolvers = {
  Query: {
    users: () => User.find(),
    user: (_, { id }) => User.findById(id)
  },
  Mutation: {
    createUser: (_, { name, email }) => User.create({ name, email })
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
```

**Q18: How do you optimize database queries?**
- Use indexes appropriately
- Select only needed fields
- Use pagination
- Implement query caching
- Use connection pooling
- Avoid N+1 queries (use joins or populate)
- Use aggregation pipelines efficiently

**Q19: Explain the difference between `process.env` and `config` files.**
- `process.env`: Environment variables, set at runtime, secure for secrets
- Config files: Application configuration, can be committed to repo (without secrets)
- Best practice: Use environment variables for sensitive data, config files for non-sensitive settings

**Q20: How do you implement graceful shutdown?**
```javascript
const server = app.listen(3000);

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    // Close database connections
    mongoose.connection.close();
    process.exit(0);
  });
});
```

---

## 14. System Design for Node.js

### Designing a URL Shortener
```
Requirements:
- Shorten long URLs
- Redirect to original URL
- Analytics (click count)
- Custom short URLs (optional)

Components:
1. API Server (Express.js)
2. Database (Redis for cache, PostgreSQL for persistence)
3. Load Balancer
4. CDN for static assets

Key Endpoints:
POST /api/shorten - Create short URL
GET /:shortCode - Redirect to original URL
GET /api/analytics/:shortCode - Get analytics

Database Schema:
- short_code (primary key)
- original_url
- created_at
- click_count
- user_id (optional)

Algorithm:
- Base62 encoding for short codes
- Check for collisions
- Cache frequently accessed URLs
```

### Designing a Real-time Chat Application
```
Requirements:
- Real-time messaging
- Multiple chat rooms
- User presence
- Message history

Components:
1. WebSocket Server (Socket.io)
2. Message Queue (Redis Pub/Sub)
3. Database (MongoDB for messages)
4. Authentication (JWT)

Architecture:
- WebSocket connections for real-time
- Redis for pub/sub across multiple servers
- MongoDB for message persistence
- JWT for authentication
- Rate limiting for message sending
```

### Designing an E-commerce API
```
Requirements:
- Product catalog
- Shopping cart
- Order management
- Payment processing
- Inventory management

Components:
1. API Gateway
2. Microservices:
   - Product Service
   - Cart Service
   - Order Service
   - Payment Service
   - Inventory Service
3. Message Queue (RabbitMQ/Kafka)
4. Database (PostgreSQL, MongoDB)
5. Cache (Redis)

Key Considerations:
- Transaction management
- Event-driven architecture
- Saga pattern for distributed transactions
- CQRS for read/write separation
```

---

## Practice Exercises

### Exercise 1: Create a RESTful API
Build a complete REST API for a blog with:
- User authentication (JWT)
- CRUD operations for posts
- Comments on posts
- Pagination and filtering
- Input validation
- Error handling

### Exercise 2: Implement Caching
Add Redis caching to an existing API:
- Cache frequently accessed data
- Implement cache invalidation
- Handle cache misses

### Exercise 3: Build a WebSocket Server
Create a real-time notification system:
- User connections
- Broadcasting messages
- Private messaging
- Connection management

### Exercise 4: Optimize Database Queries
Given slow queries, optimize them:
- Add indexes
- Refactor N+1 queries
- Implement pagination
- Use aggregation pipelines

### Exercise 5: Implement Rate Limiting
Add rate limiting to an API:
- Per IP limiting
- Per user limiting
- Different limits for different endpoints
- Redis-backed storage

---

## Key Takeaways for Interview

1. **Understand the Event Loop**: Be able to explain how Node.js handles asynchronous operations
2. **Know Your Frameworks**: Deep understanding of Express.js, familiarity with Nest.js/Koa
3. **Database Expertise**: Comfortable with both SQL and NoSQL, understand ORMs/ODMs
4. **Security Awareness**: Input validation, authentication, authorization, XSS/SQL injection prevention
5. **Performance**: Caching, connection pooling, query optimization, load balancing
6. **Testing**: Unit, integration, and E2E testing
7. **DevOps**: Docker, Kubernetes, CI/CD, monitoring
8. **Best Practices**: Error handling, logging, code organization, design patterns

---

## Resources for Further Study

- Node.js Official Documentation: https://nodejs.org/docs
- Express.js Guide: https://expressjs.com/en/guide/routing.html
- MongoDB University: Free courses on MongoDB
- AWS/Docker/Kubernetes: Cloud platform documentation
- GitHub: Study popular Node.js projects
- LeetCode: Practice algorithm problems in JavaScript

---

Good luck with your interviews! 🚀

