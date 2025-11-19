# Modern JavaScript: ES6 to Latest (ES2023)
## Complete Guide with Examples and Best Practices

### Table of Contents
1. [ES6 (ES2015) Features](#es6-es2015-features)
2. [ES7-ES8 Features](#es7-es8-features)
3. [ES9-ES10 Features](#es9-es10-features)
4. [ES11-ES12 Features](#es11-es12-features)
5. [ES13-ES14 Features](#es13-es14-features)
6. [Code Quality Standards](#code-quality-standards)
7. [Common Issues & Fixes](#common-issues--fixes)
8. [Best Practices](#best-practices)

---

## ES6 (ES2015) Features

### 1. Let and Const

**Standard Answer:**
`let` and `const` are block-scoped variable declarations that replace `var`. `let` allows reassignment, while `const` creates a constant reference (the value itself can be mutable if it's an object).

**Old Way (ES5):**
```javascript
// ❌ Problem: var is function-scoped, not block-scoped
function example() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10 - x is accessible outside the block!
}

// ❌ Problem: Hoisting issues
console.log(y); // undefined (not an error!)
var y = 5;
```

**New Way (ES6):**
```javascript
// ✅ let is block-scoped
function example() {
  if (true) {
    let x = 10;
  }
  console.log(x); // ReferenceError: x is not defined
}

// ✅ Temporal Dead Zone - cannot access before declaration
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 5;

// ✅ const for constants
const PI = 3.14159;
// PI = 3.14; // TypeError: Assignment to constant variable

// ✅ const with objects (reference is constant, properties can change)
const user = { name: 'John' };
user.name = 'Jane'; // ✅ Allowed
user = {}; // ❌ Error: Cannot reassign
```

**Interview Question:**
**Q: What's the difference between var, let, and const?**

**Standard Answer:**
- `var`: Function-scoped, hoisted, can be redeclared
- `let`: Block-scoped, not hoisted (TDZ), cannot be redeclared, can be reassigned
- `const`: Block-scoped, not hoisted (TDZ), cannot be redeclared, cannot be reassigned

**Real-World Issue:**
```javascript
// ❌ Old code - loop variable issue
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // Prints 3, 3, 3 (all closures share same i)
  }, 100);
}

// ✅ Fixed with let
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // Prints 0, 1, 2 (each iteration has its own i)
  }, 100);
}
```

---

### 2. Arrow Functions

**Standard Answer:**
Arrow functions provide a shorter syntax and lexically bind `this`. They don't have their own `this`, `arguments`, `super`, or `new.target`.

**Old Way:**
```javascript
// ❌ Verbose
const add = function(a, b) {
  return a + b;
};

// ❌ this binding issues
const obj = {
  name: 'John',
  greet: function() {
    setTimeout(function() {
      console.log(this.name); // undefined (this is window/global)
    }, 100);
  }
};
```

**New Way:**
```javascript
// ✅ Concise
const add = (a, b) => a + b;

// ✅ Multiple lines
const multiply = (a, b) => {
  const result = a * b;
  return result;
};

// ✅ this binding preserved
const obj = {
  name: 'John',
  greet: function() {
    setTimeout(() => {
      console.log(this.name); // 'John' (this refers to obj)
    }, 100);
  }
};

// ✅ Single parameter - no parentheses needed
const square = x => x * x;

// ✅ No parameters
const getTime = () => new Date();
```

**When NOT to Use Arrow Functions:**
```javascript
// ❌ Don't use for object methods (loses this)
const obj = {
  name: 'John',
  greet: () => {
    console.log(this.name); // undefined
  }
};

// ✅ Use regular function
const obj = {
  name: 'John',
  greet: function() {
    console.log(this.name); // 'John'
  }
};

// ❌ Don't use for constructors
const Person = (name) => {
  this.name = name; // Error: Arrow functions can't be constructors
};

// ✅ Use regular function
function Person(name) {
  this.name = name;
}
```

---

### 3. Template Literals

**Standard Answer:**
Template literals use backticks and allow embedded expressions, multi-line strings, and string interpolation.

**Old Way:**
```javascript
// ❌ Concatenation is messy
const name = 'John';
const age = 30;
const message = 'Hello, ' + name + '. You are ' + age + ' years old.';

// ❌ Multi-line strings are awkward
const html = '<div>' +
  '<h1>Title</h1>' +
  '<p>Content</p>' +
  '</div>';
```

**New Way:**
```javascript
// ✅ Clean interpolation
const name = 'John';
const age = 30;
const message = `Hello, ${name}. You are ${age} years old.`;

// ✅ Multi-line strings
const html = `
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
`;

// ✅ Expressions
const a = 5;
const b = 10;
const result = `The sum of ${a} and ${b} is ${a + b}.`;

// ✅ Tagged templates
function highlight(strings, ...values) {
  return strings.reduce((result, string, i) => {
    return result + string + (values[i] ? `<mark>${values[i]}</mark>` : '');
  }, '');
}

const name = 'John';
const age = 30;
highlight`Hello, ${name}. You are ${age} years old.`;
// Returns: "Hello, <mark>John</mark>. You are <mark>30</mark> years old."
```

---

### 4. Destructuring

**Standard Answer:**
Destructuring allows extracting values from arrays or properties from objects into distinct variables.

**Array Destructuring:**
```javascript
// ✅ Basic
const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1, 2, 3

// ✅ Skip elements
const [first, , third] = [1, 2, 3];
console.log(first, third); // 1, 3

// ✅ Default values
const [x = 10, y = 20] = [1];
console.log(x, y); // 1, 20

// ✅ Rest operator
const [head, ...tail] = [1, 2, 3, 4];
console.log(head); // 1
console.log(tail); // [2, 3, 4]

// ✅ Swap variables
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2, 1
```

**Object Destructuring:**
```javascript
// ✅ Basic
const user = { name: 'John', age: 30, email: 'john@example.com' };
const { name, age } = user;
console.log(name, age); // John 30

// ✅ Rename variables
const { name: userName, age: userAge } = user;
console.log(userName, userAge); // John 30

// ✅ Default values
const { name, age, city = 'Unknown' } = user;
console.log(city); // Unknown

// ✅ Nested destructuring
const user = {
  name: 'John',
  address: {
    street: '123 Main St',
    city: 'New York'
  }
};
const { address: { city } } = user;
console.log(city); // New York

// ✅ Function parameters
function greet({ name, age }) {
  console.log(`Hello, ${name}. You are ${age}.`);
}
greet({ name: 'John', age: 30 });
```

**Real-World Example:**
```javascript
// ❌ Old way
function processUser(user) {
  const name = user.name;
  const email = user.email;
  const age = user.age || 0;
  // ...
}

// ✅ New way
function processUser({ name, email, age = 0 }) {
  // ...
}
```

---

### 5. Spread and Rest Operators

**Standard Answer:**
The spread operator (`...`) expands arrays/objects, while the rest operator collects remaining elements.

**Spread Operator:**
```javascript
// ✅ Copy array
const arr1 = [1, 2, 3];
const arr2 = [...arr1]; // [1, 2, 3] (new array)

// ✅ Combine arrays
const arr3 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

// ✅ Copy object
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1 }; // { a: 1, b: 2 } (new object)

// ✅ Merge objects
const obj3 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// ✅ Override properties
const obj4 = { ...obj1, a: 10 }; // { a: 10, b: 2 }

// ✅ Function arguments
const numbers = [1, 2, 3];
Math.max(...numbers); // 3 (instead of Math.max(1, 2, 3))
```

**Rest Operator:**
```javascript
// ✅ Collect remaining arguments
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
sum(1, 2, 3, 4); // 10

// ✅ Destructuring with rest
const [first, ...rest] = [1, 2, 3, 4];
console.log(first); // 1
console.log(rest); // [2, 3, 4]

const { a, ...others } = { a: 1, b: 2, c: 3 };
console.log(others); // { b: 2, c: 3 }
```

**Real-World Issue:**
```javascript
// ❌ Old way - arguments object
function oldSum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

// ✅ New way - rest operator
function newSum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
```

---

### 6. Default Parameters

**Standard Answer:**
Default parameters allow function parameters to have default values if not provided or undefined.

**Old Way:**
```javascript
// ❌ Verbose default handling
function greet(name, age) {
  name = name || 'Guest';
  age = age || 0;
  console.log(`Hello, ${name}. You are ${age}.`);
}
```

**New Way:**
```javascript
// ✅ Clean default parameters
function greet(name = 'Guest', age = 0) {
  console.log(`Hello, ${name}. You are ${age}.`);
}

greet(); // Hello, Guest. You are 0.
greet('John'); // Hello, John. You are 0.
greet('John', 30); // Hello, John. You are 30.

// ✅ Can use expressions
function createUser(name, createdAt = new Date()) {
  return { name, createdAt };
}

// ✅ Can use previous parameters
function multiply(a, b = a) {
  return a * b;
}
multiply(5); // 25 (b defaults to a)
```

---

### 7. Classes

**Standard Answer:**
ES6 classes are syntactic sugar over JavaScript's prototype-based inheritance. They provide a cleaner way to create objects and handle inheritance.

**Old Way:**
```javascript
// ❌ Prototype-based (verbose)
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};

Person.prototype.getAge = function() {
  return this.age;
};
```

**New Way:**
```javascript
// ✅ Class syntax
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `Hello, I'm ${this.name}`;
  }

  getAge() {
    return this.age;
  }

  // Static method
  static createAdult(name) {
    return new Person(name, 18);
  }

  // Getter
  get info() {
    return `${this.name} is ${this.age} years old`;
  }

  // Setter
  set age(newAge) {
    if (newAge < 0) {
      throw new Error('Age cannot be negative');
    }
    this._age = newAge;
  }
}

// Inheritance
class Student extends Person {
  constructor(name, age, school) {
    super(name, age); // Call parent constructor
    this.school = school;
  }

  study() {
    return `${this.name} is studying at ${this.school}`;
  }

  // Override parent method
  greet() {
    return `${super.greet()} and I'm a student`;
  }
}
```

---

### 8. Promises

**Standard Answer:**
Promises represent the eventual completion (or failure) of an asynchronous operation. They provide a cleaner alternative to callbacks.

**Old Way:**
```javascript
// ❌ Callback hell
function fetchData(callback) {
  setTimeout(() => {
    callback(null, 'Data');
  }, 1000);
}

fetchData((err, data) => {
  if (err) {
    console.error(err);
  } else {
    console.log(data);
  }
});
```

**New Way:**
```javascript
// ✅ Promise
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('Data');
      // or reject(new Error('Failed'));
    }, 1000);
  });
}

fetchData()
  .then(data => console.log(data))
  .catch(err => console.error(err));

// ✅ Promise.all
Promise.all([
  fetch('/api/users'),
  fetch('/api/posts')
])
  .then(([users, posts]) => {
    console.log(users, posts);
  });

// ✅ Promise.race
Promise.race([
  fetch('/api/slow'),
  fetch('/api/fast')
])
  .then(result => console.log('Fastest:', result));
```

---

## ES7-ES8 Features

### 1. Array.includes()

**Standard Answer:**
`includes()` checks if an array contains a specific element, returning true or false.

```javascript
// ❌ Old way
const arr = [1, 2, 3];
if (arr.indexOf(2) !== -1) {
  console.log('Found');
}

// ✅ New way
const arr = [1, 2, 3];
if (arr.includes(2)) {
  console.log('Found');
}

// ✅ Works with NaN (indexOf doesn't)
[NaN].includes(NaN); // true
[NaN].indexOf(NaN); // -1
```

---

### 2. Exponentiation Operator

```javascript
// ❌ Old way
Math.pow(2, 3); // 8

// ✅ New way
2 ** 3; // 8
```

---

### 3. Object.entries() and Object.values()

**Standard Answer:**
`Object.entries()` returns an array of [key, value] pairs. `Object.values()` returns an array of values.

```javascript
const obj = { a: 1, b: 2, c: 3 };

// Object.keys() - ES5
Object.keys(obj); // ['a', 'b', 'c']

// Object.values() - ES8
Object.values(obj); // [1, 2, 3]

// Object.entries() - ES8
Object.entries(obj); // [['a', 1], ['b', 2], ['c', 3]]

// ✅ Convert object to Map
const map = new Map(Object.entries(obj));

// ✅ Iterate over object
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value);
}
```

---

### 4. String Padding

```javascript
// padStart() and padEnd()
'5'.padStart(3, '0'); // '005'
'5'.padEnd(3, '0'); // '500'

// Real-world: Format numbers
const id = 42;
id.toString().padStart(6, '0'); // '000042'
```

---

### 5. Trailing Commas

```javascript
// ✅ Allowed in function parameters, arrays, objects
function greet(
  name,
  age, // Trailing comma - easier to add new parameters
) {
  // ...
}

const arr = [
  1,
  2,
  3, // Trailing comma
];

const obj = {
  a: 1,
  b: 2,
  c: 3, // Trailing comma
};
```

---

## ES9-ES10 Features

### 1. Async Iteration (for-await-of)

**Standard Answer:**
`for-await-of` allows iterating over async iterables, making it easier to handle asynchronous data streams.

```javascript
// ✅ Iterate over async data
async function fetchUsers() {
  const users = [];
  for await (const user of fetchUserStream()) {
    users.push(user);
  }
  return users;
}
```

---

### 2. Rest/Spread for Objects

```javascript
// ✅ Spread in objects (ES9)
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// ✅ Rest in objects (ES9)
const { a, ...rest } = { a: 1, b: 2, c: 3 };
console.log(rest); // { b: 2, c: 3 }
```

---

### 3. Array.flat() and flatMap()

**Standard Answer:**
`flat()` flattens nested arrays. `flatMap()` maps and then flattens.

```javascript
// ✅ flat()
const arr = [1, [2, 3], [4, [5, 6]]];
arr.flat(); // [1, 2, 3, 4, [5, 6]]
arr.flat(2); // [1, 2, 3, 4, 5, 6] (depth 2)

// ✅ flatMap()
const arr = [1, 2, 3];
arr.flatMap(x => [x, x * 2]); // [1, 2, 2, 4, 3, 6]
// Equivalent to: arr.map(x => [x, x * 2]).flat()
```

---

### 4. Object.fromEntries()

**Standard Answer:**
`Object.fromEntries()` transforms a list of key-value pairs into an object (reverse of `Object.entries()`).

```javascript
// ✅ Convert array to object
const entries = [['a', 1], ['b', 2], ['c', 3]];
Object.fromEntries(entries); // { a: 1, b: 2, c: 3 }

// ✅ Convert Map to object
const map = new Map([['a', 1], ['b', 2]]);
Object.fromEntries(map); // { a: 1, b: 2 }

// ✅ Transform object
const obj = { a: 1, b: 2, c: 3 };
const doubled = Object.fromEntries(
  Object.entries(obj).map(([key, value]) => [key, value * 2])
);
// { a: 2, b: 4, c: 6 }
```

---

## ES11-ES12 Features

### 1. Optional Chaining (?.)

**Standard Answer:**
Optional chaining allows safe access to nested object properties without checking if each reference is null/undefined.

**Old Way:**
```javascript
// ❌ Verbose null checking
const user = {
  address: {
    street: '123 Main St'
  }
};

if (user && user.address && user.address.street) {
  console.log(user.address.street);
}

// ❌ Using logical AND
const street = user && user.address && user.address.street;
```

**New Way:**
```javascript
// ✅ Optional chaining
const street = user?.address?.street;
console.log(street); // '123 Main St' or undefined

// ✅ With function calls
user?.getName?.(); // Only calls if getName exists

// ✅ With arrays
const firstItem = arr?.[0];

// ✅ Combined with nullish coalescing
const street = user?.address?.street ?? 'Unknown';
```

**Real-World Issue:**
```javascript
// ❌ Old code - crashes if user is null
function getStreet(user) {
  return user.address.street; // TypeError if user is null
}

// ✅ Fixed
function getStreet(user) {
  return user?.address?.street ?? 'Unknown';
}
```

---

### 2. Nullish Coalescing (??)

**Standard Answer:**
The nullish coalescing operator returns the right-hand operand when the left-hand is null or undefined (not just falsy).

**Old Way:**
```javascript
// ❌ Problem: || treats 0, '', false as falsy
const count = user.count || 10; // If count is 0, defaults to 10 (wrong!)
const name = user.name || 'Guest'; // If name is '', defaults to 'Guest' (wrong!)
```

**New Way:**
```javascript
// ✅ Only null/undefined trigger default
const count = user.count ?? 10; // If count is 0, keeps 0
const name = user.name ?? 'Guest'; // If name is '', keeps ''

// ✅ Combined with optional chaining
const street = user?.address?.street ?? 'Unknown';
```

---

### 3. BigInt

**Standard Answer:**
BigInt allows representing integers larger than Number.MAX_SAFE_INTEGER.

```javascript
// ✅ Create BigInt
const bigNumber = 9007199254740991n; // n suffix
const bigNumber2 = BigInt(9007199254740991);

// ✅ Operations
const sum = bigNumber + 1n;

// ⚠️ Cannot mix with regular numbers
const result = bigNumber + 1; // TypeError
const result = bigNumber + 1n; // ✅
```

---

### 4. Promise.allSettled()

**Standard Answer:**
`Promise.allSettled()` waits for all promises to settle (fulfill or reject), unlike `Promise.all()` which fails fast.

```javascript
// ✅ Wait for all, even if some fail
Promise.allSettled([
  Promise.resolve('Success'),
  Promise.reject('Error'),
  Promise.resolve('Another success')
])
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

### 5. Dynamic import()

**Standard Answer:**
Dynamic import allows loading modules conditionally at runtime.

```javascript
// ✅ Load module conditionally
if (condition) {
  const module = await import('./module.js');
  module.doSomething();
}

// ✅ With destructuring
const { function1, function2 } = await import('./module.js');
```

---

## ES13-ES14 Features

### 1. Top-level await

**Standard Answer:**
Top-level await allows using await at the module level without wrapping in an async function.

```javascript
// ✅ Top-level await (ES13)
const data = await fetch('/api/data').then(r => r.json());
console.log(data);

// Before ES13, had to wrap:
(async () => {
  const data = await fetch('/api/data').then(r => r.json());
  console.log(data);
})();
```

---

### 2. Array.at()

**Standard Answer:**
`at()` method allows accessing array elements using negative indices (from the end).

```javascript
const arr = [1, 2, 3, 4, 5];

// ✅ Positive index
arr.at(0); // 1
arr.at(2); // 3

// ✅ Negative index (from end)
arr.at(-1); // 5 (last element)
arr.at(-2); // 4 (second to last)

// Old way
arr[arr.length - 1]; // 5 (verbose)
```

---

### 3. Object.hasOwn()

**Standard Answer:**
`Object.hasOwn()` is a safer alternative to `hasOwnProperty()`.

```javascript
const obj = { a: 1 };

// ❌ Old way - can be overridden
obj.hasOwnProperty('a'); // true

// ✅ New way - safer
Object.hasOwn(obj, 'a'); // true

// Why safer?
const obj2 = Object.create(null);
obj2.a = 1;
obj2.hasOwnProperty('a'); // TypeError
Object.hasOwn(obj2, 'a'); // true ✅
```

---

## Code Quality Standards

### 1. Naming Conventions

**Standard Answer:**
Follow consistent naming conventions for better code readability and maintainability.

```javascript
// ✅ Variables and functions: camelCase
const userName = 'John';
function getUserData() {}

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_USERS = 100;
const API_BASE_URL = 'https://api.example.com';

// ✅ Classes: PascalCase
class UserService {}
class DatabaseConnection {}

// ✅ Private properties: _prefix or #private
class User {
  _internalId = 123; // Convention (still accessible)
  #privateId = 456; // Truly private (ES2022)
}

// ✅ Boolean: is/has/should prefix
const isActive = true;
const hasPermission = false;
const shouldValidate = true;
```

---

### 2. Function Design

**Standard Answer:**
Functions should be small, focused, and do one thing well.

```javascript
// ❌ Bad: Too many responsibilities
function processUser(user) {
  // Validate
  if (!user.name) throw new Error('Name required');
  if (!user.email) throw new Error('Email required');
  
  // Transform
  user.name = user.name.toUpperCase();
  user.email = user.email.toLowerCase();
  
  // Save
  database.save(user);
  
  // Notify
  emailService.send(user.email);
  
  // Log
  logger.log('User processed');
}

// ✅ Good: Single responsibility
function validateUser(user) {
  if (!user.name) throw new Error('Name required');
  if (!user.email) throw new Error('Email required');
}

function normalizeUser(user) {
  return {
    ...user,
    name: user.name.toUpperCase(),
    email: user.email.toLowerCase()
  };
}

async function processUser(user) {
  validateUser(user);
  const normalized = normalizeUser(user);
  await saveUser(normalized);
  await notifyUser(normalized);
  logger.log('User processed');
}
```

---

### 3. Error Handling

**Standard Answer:**
Always handle errors explicitly. Use try-catch for async operations, validate inputs, and provide meaningful error messages.

```javascript
// ❌ Bad: Silent failures
function divide(a, b) {
  return a / b; // Returns Infinity if b is 0
}

// ✅ Good: Explicit error handling
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a / b;
}

// ✅ Good: Async error handling
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

---

### 4. Code Comments

**Standard Answer:**
Write self-documenting code. Use comments to explain "why", not "what".

```javascript
// ❌ Bad: Comments explain what code does
// Increment i by 1
i++;

// ✅ Good: Code is self-explanatory
userCount++;

// ✅ Good: Comment explains why
// Using bitwise OR for faster integer conversion
const id = userId | 0;

// ✅ Good: JSDoc for functions
/**
 * Calculates the total price including tax
 * @param {number} price - Base price
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns {number} Total price with tax
 */
function calculateTotal(price, taxRate) {
  return price * (1 + taxRate);
}
```

---

## Common Issues & Fixes

### Issue 1: Memory Leaks

**Problem:**
```javascript
// ❌ Memory leak: Event listeners not removed
class Component {
  constructor() {
    this.data = new Array(1000000).fill(0);
    window.addEventListener('resize', this.handleResize);
  }
  
  handleResize() {
    console.log('Resized');
  }
}

const component = new Component();
// Component is never cleaned up, listener remains
```

**Fix:**
```javascript
// ✅ Proper cleanup
class Component {
  constructor() {
    this.data = new Array(1000000).fill(0);
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }
  
  handleResize() {
    console.log('Resized');
  }
  
  destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.data = null; // Help GC
  }
}
```

---

### Issue 2: Race Conditions

**Problem:**
```javascript
// ❌ Race condition: Multiple async operations
let userData = null;

async function loadUser(id) {
  const response = await fetch(`/api/users/${id}`);
  userData = await response.json();
}

loadUser(1);
loadUser(2); // Overwrites userData from first call
```

**Fix:**
```javascript
// ✅ Use local variable or return value
async function loadUser(id) {
  const response = await fetch(`/api/users/${id}`);
  return await response.json();
}

// Use returned value
const user1 = await loadUser(1);
const user2 = await loadUser(2);
```

---

### Issue 3: Mutating Shared State

**Problem:**
```javascript
// ❌ Mutating shared object
const config = { theme: 'dark' };

function changeTheme(newTheme) {
  config.theme = newTheme; // Mutates original
}

changeTheme('light');
console.log(config.theme); // 'light' - original changed!
```

**Fix:**
```javascript
// ✅ Immutable updates
const config = { theme: 'dark' };

function changeTheme(config, newTheme) {
  return { ...config, theme: newTheme }; // New object
}

const newConfig = changeTheme(config, 'light');
console.log(config.theme); // 'dark' - original unchanged
console.log(newConfig.theme); // 'light'
```

---

### Issue 4: Callback Hell

**Problem:**
```javascript
// ❌ Nested callbacks
getUser(id, (user) => {
  getPosts(user.id, (posts) => {
    getComments(posts[0].id, (comments) => {
      console.log(comments);
    });
  });
});
```

**Fix:**
```javascript
// ✅ Async/await
async function loadData(userId) {
  const user = await getUser(userId);
  const posts = await getPosts(user.id);
  const comments = await getComments(posts[0].id);
  console.log(comments);
}
```

---

## Best Practices

### 1. Use Strict Mode

```javascript
// ✅ Always use strict mode
'use strict';

// Prevents common mistakes
function test() {
  undeclaredVar = 10; // Error in strict mode
}
```

### 2. Prefer const over let

```javascript
// ✅ Use const by default
const users = [];
const config = {};

// Only use let when reassignment is needed
let currentUser = null;
currentUser = getUser();
```

### 3. Avoid Magic Numbers

```javascript
// ❌ Magic numbers
if (user.age >= 18) { }

// ✅ Named constants
const MIN_AGE = 18;
if (user.age >= MIN_AGE) { }
```

### 4. Use Descriptive Names

```javascript
// ❌ Unclear
const d = new Date();
const u = getUsers();

// ✅ Clear
const currentDate = new Date();
const activeUsers = getUsers();
```

### 5. Handle Edge Cases

```javascript
// ✅ Always handle edge cases
function divide(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Arguments must be numbers');
  }
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}
```

---

This guide covers modern JavaScript from ES6 to ES2023 with practical examples, common issues, and best practices. Study each feature with the provided examples and understand when to use each one.

