/**
 * Async Patterns Comparison
 * Callbacks, Promises, and Async/Await
 */

const fs = require('fs').promises;

// ===== CALLBACK PATTERN (Old way) =====
function readFileCallback(filename, callback) {
  fs.readFile(filename, 'utf8')
    .then(data => callback(null, data))
    .catch(err => callback(err, null));
}

// Usage - Callback Hell
readFileCallback('file1.txt', (err1, data1) => {
  if (err1) {
    console.error('Error reading file1:', err1);
    return;
  }
  readFileCallback('file2.txt', (err2, data2) => {
    if (err2) {
      console.error('Error reading file2:', err2);
      return;
    }
    console.log('Callback result:', data1 + data2);
  });
});

// ===== PROMISE PATTERN =====
function readFilePromise(filename) {
  return fs.readFile(filename, 'utf8');
}

// Sequential
readFilePromise('file1.txt')
  .then(data1 => {
    return readFilePromise('file2.txt').then(data2 => {
      return data1 + data2;
    });
  })
  .then(result => {
    console.log('Promise result:', result);
  })
  .catch(err => {
    console.error('Promise error:', err);
  });

// Parallel
Promise.all([
  readFilePromise('file1.txt'),
  readFilePromise('file2.txt')
])
  .then(([data1, data2]) => {
    console.log('Promise.all result:', data1 + data2);
  })
  .catch(err => {
    console.error('Promise.all error:', err);
  });

// ===== ASYNC/AWAIT PATTERN =====
async function readFilesAsync() {
  try {
    // Sequential
    const data1 = await readFilePromise('file1.txt');
    const data2 = await readFilePromise('file2.txt');
    console.log('Async/Await sequential:', data1 + data2);
    
    // Parallel
    const [data3, data4] = await Promise.all([
      readFilePromise('file1.txt'),
      readFilePromise('file2.txt')
    ]);
    console.log('Async/Await parallel:', data3 + data4);
  } catch (err) {
    console.error('Async/Await error:', err);
  }
}

readFilesAsync();

// ===== ERROR HANDLING PATTERNS =====

// Pattern 1: Try-Catch
async function withTryCatch() {
  try {
    const data = await fs.readFile('file.txt', 'utf8');
    return data;
  } catch (err) {
    console.error('Error:', err);
    throw err; // Re-throw if needed
  }
}

// Pattern 2: Promise catch
async function withPromiseCatch() {
  const data = await fs.readFile('file.txt', 'utf8')
    .catch(err => {
      console.error('Error:', err);
      return 'default content';
    });
  return data;
}

// Pattern 3: Wrapper function
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage in Express
// app.get('/route', asyncHandler(async (req, res) => {
//   const data = await someAsyncOperation();
//   res.json(data);
// }));

