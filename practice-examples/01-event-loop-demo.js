/**
 * Event Loop Demonstration
 * Understanding the execution order in Node.js
 */

console.log('=== Event Loop Demo ===\n');

// 1. Synchronous code
console.log('1. Synchronous');

// 2. process.nextTick - highest priority
process.nextTick(() => {
  console.log('2. process.nextTick');
});

// 3. Promise - microtask queue
Promise.resolve().then(() => {
  console.log('3. Promise resolved');
});

// 4. setTimeout - timer phase
setTimeout(() => {
  console.log('4. setTimeout (0ms)');
}, 0);

// 5. setImmediate - check phase
setImmediate(() => {
  console.log('5. setImmediate');
});

// 6. More synchronous code
console.log('6. More synchronous');

// Expected output:
// 1. Synchronous
// 6. More synchronous
// 2. process.nextTick
// 3. Promise resolved
// 4. setTimeout (0ms)
// 5. setImmediate

