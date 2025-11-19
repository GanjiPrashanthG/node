# Missing JavaScript Concepts - Complete Guide

## Table of Contents
1. [Getters and Setters](#getters-and-setters)
2. [Higher Order Functions](#higher-order-functions)
3. [Closures (Enhanced)](#closures-enhanced)
4. [Currying](#currying)
5. [Function Composition](#function-composition)
6. [Memoization](#memoization)

---

## Getters and Setters

### What are Getters and Setters?

**Standard Answer:**
Getters and setters are special methods that allow you to define how properties are accessed and modified. They provide a way to intercept property access and add logic (validation, computation, etc.) without changing the external interface.

**Simple Explanation:**
Think of getters and setters as security guards for object properties. When someone tries to read a property (getter), you can control what they get. When someone tries to change a property (setter), you can validate or transform the value before storing it.

### Basic Syntax

```javascript
// Object literal syntax
const obj = {
  _name: '', // Private property (convention)
  
  // Getter
  get name() {
    return this._name.toUpperCase(); // Transform on access
  },
  
  // Setter
  set name(value) {
    if (value.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    this._name = value;
  }
};

obj.name = 'John';
console.log(obj.name); // 'JOHN' (uppercase)
console.log(obj._name); // 'John' (original)

// Class syntax
class User {
  constructor(firstName, lastName) {
    this._firstName = firstName;
    this._lastName = lastName;
  }
  
  // Getter - computed property
  get fullName() {
    return `${this._firstName} ${this._lastName}`;
  }
  
  // Setter - can split full name
  set fullName(name) {
    const [firstName, ...lastNameParts] = name.split(' ');
    this._firstName = firstName;
    this._lastName = lastNameParts.join(' ');
  }
  
  // Getter with validation
  get age() {
    return this._age;
  }
  
  set age(value) {
    if (value < 0 || value > 120) {
      throw new Error('Age must be between 0 and 120');
    }
    this._age = value;
  }
}

const user = new User('John', 'Doe');
console.log(user.fullName); // 'John Doe'
user.fullName = 'Jane Smith';
console.log(user._firstName); // 'Jane'
console.log(user._lastName); // 'Smith'
```

### Real-World Examples

**Example 1: Temperature Converter**
```javascript
class Temperature {
  constructor(celsius) {
    this._celsius = celsius;
  }
  
  get celsius() {
    return this._celsius;
  }
  
  set celsius(value) {
    this._celsius = value;
  }
  
  get fahrenheit() {
    return (this._celsius * 9/5) + 32;
  }
  
  set fahrenheit(value) {
    this._celsius = (value - 32) * 5/9;
  }
}

const temp = new Temperature(25);
console.log(temp.celsius); // 25
console.log(temp.fahrenheit); // 77
temp.fahrenheit = 100;
console.log(temp.celsius); // 37.777...
```

**Example 2: User with Validation**
```javascript
class User {
  constructor() {
    this._email = '';
  }
  
  get email() {
    return this._email;
  }
  
  set email(value) {
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    this._email = value.toLowerCase();
  }
}

const user = new User();
user.email = 'John@Example.COM';
console.log(user.email); // 'john@example.com'
user.email = 'invalid'; // Error: Invalid email format
```

**Example 3: Lazy Loading with Getter**
```javascript
class DataLoader {
  constructor() {
    this._data = null;
  }
  
  get data() {
    if (!this._data) {
      console.log('Loading data...');
      this._data = this.loadExpensiveData();
    }
    return this._data;
  }
  
  loadExpensiveData() {
    // Expensive operation (database query, API call, etc.)
    return { users: [1, 2, 3], posts: [4, 5, 6] };
  }
}

const loader = new DataLoader();
console.log(loader.data); // 'Loading data...' then returns data
console.log(loader.data); // Returns cached data (no loading)
```

### Interview Questions

**Q: What's the difference between a getter and a regular method?**

**Standard Answer:**
- **Getter**: Accessed like a property (`obj.name`), no parentheses
- **Method**: Called like a function (`obj.getName()`), requires parentheses
- **Getter**: Computed on access, can be cached
- **Method**: Explicit call, always executes

```javascript
class Example {
  get computed() {
    return Math.random(); // Computed each time
  }
  
  getValue() {
    return Math.random(); // Called explicitly
  }
}

const ex = new Example();
console.log(ex.computed); // No parentheses
console.log(ex.getValue()); // With parentheses
```

**Q: When would you use getters and setters?**

**Standard Answer:**
- **Validation**: Validate input before setting
- **Computed Properties**: Derive values from other properties
- **Lazy Loading**: Load expensive data only when accessed
- **Encapsulation**: Control access to private data
- **Logging**: Track property access/modification
- **Data Transformation**: Transform data on get/set

---

## Higher Order Functions

### What are Higher Order Functions?

**Standard Answer:**
A higher-order function is a function that either:
1. Takes one or more functions as arguments, OR
2. Returns a function as its result

**Simple Explanation:**
Think of higher-order functions as function factories or function manipulators. They work with other functions, either by accepting them as input or producing them as output.

### Functions that Accept Functions

**Common Examples: Array Methods**

```javascript
// map() - transforms each element
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// filter() - selects elements
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4]

// reduce() - accumulates values
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 15

// forEach() - executes for each element
numbers.forEach(num => console.log(num));

// find() - finds first matching element
const found = numbers.find(num => num > 3);
console.log(found); // 4

// some() - checks if any element matches
const hasEven = numbers.some(num => num % 2 === 0);
console.log(hasEven); // true

// every() - checks if all elements match
const allPositive = numbers.every(num => num > 0);
console.log(allPositive); // true
```

**Custom Higher Order Function**

```javascript
// Function that accepts a function
function repeatOperation(operation, times) {
  for (let i = 0; i < times; i++) {
    operation(i);
  }
}

repeatOperation((index) => {
  console.log(`Iteration ${index}`);
}, 3);
// Output:
// Iteration 0
// Iteration 1
// Iteration 2

// Function with multiple function parameters
function processData(data, transform, filter, reduce) {
  return data
    .map(transform)
    .filter(filter)
    .reduce(reduce, 0);
}

const result = processData(
  [1, 2, 3, 4, 5],
  x => x * 2,        // transform
  x => x > 4,         // filter
  (acc, x) => acc + x // reduce
);
console.log(result); // 14 (6 + 8)
```

### Functions that Return Functions

**Example 1: Function Factory**

```javascript
// Returns a function
function createMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// Arrow function version
const createMultiplier = multiplier => number => number * multiplier;
```

**Example 2: Logger Factory**

```javascript
function createLogger(prefix) {
  return function(message) {
    console.log(`[${prefix}] ${message}`);
  };
}

const errorLogger = createLogger('ERROR');
const infoLogger = createLogger('INFO');

errorLogger('Something went wrong'); // [ERROR] Something went wrong
infoLogger('Application started'); // [INFO] Application started
```

**Example 3: Validation Function**

```javascript
function createValidator(rule) {
  return function(value) {
    return rule(value);
  };
}

const isEmail = createValidator(value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
const isPositive = createValidator(value => value > 0);

console.log(isEmail('test@example.com')); // true
console.log(isPositive(-5)); // false
```

### Real-World Examples

**Example 1: API Request Handler**

```javascript
// Higher-order function for API error handling
function withErrorHandling(apiFunction) {
  return async function(...args) {
    try {
      return await apiFunction(...args);
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(`API call failed: ${error.message}`);
    }
  };
}

// Usage
const fetchUsers = withErrorHandling(async () => {
  const response = await fetch('/api/users');
  return response.json();
});

// Now fetchUsers has automatic error handling
```

**Example 2: Timing Function**

```javascript
function withTiming(fn) {
  return function(...args) {
    const start = Date.now();
    const result = fn(...args);
    const end = Date.now();
    console.log(`Function took ${end - start}ms`);
    return result;
  };
}

const slowFunction = withTiming((n) => {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += i;
  }
  return sum;
});

slowFunction(1000000); // Function took 15ms
```

**Example 3: Retry Logic**

```javascript
function withRetry(fn, maxRetries = 3) {
  return async function(...args) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${i + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw lastError;
  };
}

const fetchWithRetry = withRetry(fetch, 3);
// Automatically retries up to 3 times on failure
```

### Interview Questions

**Q: What is a higher-order function? Give examples.**

**Standard Answer:**
A higher-order function is a function that either:
1. Takes functions as arguments (like `map`, `filter`, `reduce`)
2. Returns a function (like function factories)

**Examples:**
- `Array.map()`, `Array.filter()`, `Array.reduce()` - accept functions
- `setTimeout()`, `setInterval()` - accept functions
- Function factories that return functions
- Decorators/wrappers that enhance functions

**Q: Implement your own `map` function**

**Standard Answer:**
```javascript
function myMap(array, callback) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(callback(array[i], i, array));
  }
  return result;
}

// Usage
const numbers = [1, 2, 3];
const doubled = myMap(numbers, num => num * 2);
console.log(doubled); // [2, 4, 6]
```

---

## Closures (Enhanced)

### Deep Dive into Closures

**Standard Answer:**
A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned. The closure "closes over" the variables, keeping them alive.

**Key Concepts:**
1. **Lexical Scoping**: Inner functions have access to outer function's variables
2. **Variable Persistence**: Variables remain accessible even after outer function completes
3. **Private Variables**: Closures enable data privacy

### Advanced Closure Examples

**Example 1: Module Pattern**

```javascript
// Create private variables and public API
const counterModule = (function() {
  let count = 0; // Private variable
  
  return {
    increment: function() {
      count++;
      return count;
    },
    decrement: function() {
      count--;
      return count;
    },
    getCount: function() {
      return count;
    }
  };
})();

console.log(counterModule.increment()); // 1
console.log(counterModule.increment()); // 2
console.log(counterModule.getCount()); // 2
// count is not accessible from outside
```

**Example 2: Function Factory with Closures**

```javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance; // Private variable via closure
  
  return {
    deposit: function(amount) {
      balance += amount;
      return balance;
    },
    withdraw: function(amount) {
      if (amount > balance) {
        throw new Error('Insufficient funds');
      }
      balance -= amount;
      return balance;
    },
    getBalance: function() {
      return balance;
    }
  };
}

const account1 = createBankAccount(100);
const account2 = createBankAccount(200);

account1.deposit(50);
console.log(account1.getBalance()); // 150
console.log(account2.getBalance()); // 200 (separate closure)
```

**Example 3: Memoization with Closures**

```javascript
function memoize(fn) {
  const cache = {}; // Private cache via closure
  
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache[key]) {
      console.log('Cache hit');
      return cache[key];
    }
    console.log('Cache miss');
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

const expensiveFunction = memoize((n) => {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += i;
  }
  return sum;
});

expensiveFunction(1000000); // Cache miss
expensiveFunction(1000000); // Cache hit (uses cached result)
```

---

## Currying

### What is Currying?

**Standard Answer:**
Currying is a technique of transforming a function that takes multiple arguments into a sequence of functions that each take a single argument.

**Simple Explanation:**
Instead of `f(a, b, c)`, currying allows `f(a)(b)(c)`. Each function call returns a new function that takes the next argument.

### Basic Currying

```javascript
// Regular function
function add(a, b, c) {
  return a + b + c;
}

// Curried version
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

// Arrow function version
const curriedAddArrow = a => b => c => a + b + c;

console.log(add(1, 2, 3)); // 6
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAddArrow(1)(2)(3)); // 6

// Partial application
const addOne = curriedAdd(1);
const addOneAndTwo = addOne(2);
console.log(addOneAndTwo(3)); // 6
```

### Generic Currying Function

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...nextArgs) {
        return curried.apply(this, args.concat(nextArgs));
      };
    }
  };
}

// Usage
function multiply(a, b, c) {
  return a * b * c;
}

const curriedMultiply = curry(multiply);
console.log(curriedMultiply(2)(3)(4)); // 24
console.log(curriedMultiply(2, 3)(4)); // 24
console.log(curriedMultiply(2)(3, 4)); // 24
```

### Real-World Example: API Calls

```javascript
// Curried API function
const apiCall = method => url => data => {
  return fetch(url, {
    method,
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
};

// Create specific functions
const post = apiCall('POST');
const get = apiCall('GET');

const postToUsers = post('/api/users');
const getFromPosts = get('/api/posts');

// Usage
postToUsers({ name: 'John' });
getFromPosts();
```

---

## Function Composition

### What is Function Composition?

**Standard Answer:**
Function composition is combining multiple functions to create a new function. The output of one function becomes the input of the next.

**Simple Explanation:**
Like a pipeline: `f(g(x))` means apply `g` to `x`, then apply `f` to the result.

### Basic Composition

```javascript
// Simple composition
const addOne = x => x + 1;
const multiplyByTwo = x => x * 2;

const addOneThenMultiply = x => multiplyByTwo(addOne(x));
console.log(addOneThenMultiply(5)); // 12

// Generic compose function
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

const addOneThenMultiply = compose(multiplyByTwo, addOne);
console.log(addOneThenMultiply(5)); // 12

// Pipe (left to right)
function pipe(...fns) {
  return function(value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}

const addOneThenMultiply = pipe(addOne, multiplyByTwo);
console.log(addOneThenMultiply(5)); // 12
```

### Real-World Example: Data Processing

```javascript
const users = [
  { name: 'John', age: 25, active: true },
  { name: 'Jane', age: 30, active: false },
  { name: 'Bob', age: 20, active: true }
];

// Small, focused functions
const isActive = user => user.active;
const isAdult = user => user.age >= 18;
const getName = user => user.name;
const uppercase = str => str.toUpperCase();

// Compose them
const getActiveAdultNames = pipe(
  users => users.filter(isActive),
  users => users.filter(isAdult),
  users => users.map(getName),
  names => names.map(uppercase)
);

console.log(getActiveAdultNames(users)); // ['JOHN', 'BOB']
```

---

## Memoization

### What is Memoization?

**Standard Answer:**
Memoization is an optimization technique that caches the results of expensive function calls and returns the cached result when the same inputs occur again.

### Basic Memoization

```javascript
function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache[key]) {
      return cache[key];
    }
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

// Expensive function
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Memoized version
const memoizedFibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return memoizedFibonacci(n - 1) + memoizedFibonacci(n - 2);
});

console.time('Without memoization');
fibonacci(40); // Very slow
console.timeEnd('Without memoization');

console.time('With memoization');
memoizedFibonacci(40); // Fast
console.timeEnd('With memoization');
```

---

## Interview Questions Summary

1. **Getters/Setters**: Control property access, validation, computed properties
2. **Higher Order Functions**: Functions that take/return functions
3. **Closures**: Functions with access to outer scope variables
4. **Currying**: Transform multi-arg functions to single-arg chains
5. **Composition**: Combine functions into pipelines
6. **Memoization**: Cache function results for performance

Practice these concepts with real examples to master them for interviews!

