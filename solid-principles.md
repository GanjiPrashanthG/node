# SOLID Principles - Complete Guide for Node.js

## Table of Contents
1. [What are SOLID Principles?](#what-are-solid-principles)
2. [Single Responsibility Principle (SRP)](#single-responsibility-principle-srp)
3. [Open/Closed Principle (OCP)](#openclosed-principle-ocp)
4. [Liskov Substitution Principle (LSP)](#liskov-substitution-principle-lsp)
5. [Interface Segregation Principle (ISP)](#interface-segregation-principle-isp)
6. [Dependency Inversion Principle (DIP)](#dependency-inversion-principle-dip)
7. [Real-World Examples](#real-world-examples)
8. [Interview Questions](#interview-questions)

---

## What are SOLID Principles?

### Standard Answer

**SOLID** is an acronym for five object-oriented design principles that make software more maintainable, flexible, and understandable:

1. **S** - Single Responsibility Principle
2. **O** - Open/Closed Principle
3. **L** - Liskov Substitution Principle
4. **I** - Interface Segregation Principle
5. **D** - Dependency Inversion Principle

**Why They Matter:**
- **Maintainability**: Easier to understand and modify
- **Flexibility**: Easy to extend without breaking existing code
- **Testability**: Easier to write unit tests
- **Reusability**: Components can be reused in different contexts
- **Reduced Coupling**: Components are less dependent on each other

**Simple Explanation:**
Think of SOLID principles as best practices for organizing code. Like organizing a toolbox - each tool has a specific purpose (SRP), you can add new tools without modifying existing ones (OCP), similar tools are interchangeable (LSP), tools are designed for specific tasks (ISP), and you depend on tool interfaces, not specific brands (DIP).

---

## Single Responsibility Principle (SRP)

### Definition

**Standard Answer:**
A class or module should have only one reason to change. It should have only one job or responsibility.

**Simple Explanation:**
Each piece of code should do one thing and do it well. Like a restaurant - the chef cooks, the waiter serves, the cashier handles payments. Each has one clear responsibility.

### Violation Example

```javascript
// ❌ BAD: Multiple responsibilities
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  
  // Responsibility 1: User data management
  save() {
    // Save to database
    db.query('INSERT INTO users...');
  }
  
  // Responsibility 2: Email sending
  sendEmail(subject, body) {
    // Send email
    emailService.send(this.email, subject, body);
  }
  
  // Responsibility 3: Validation
  validate() {
    // Validate user data
    if (!this.email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
  
  // Responsibility 4: Logging
  log() {
    console.log(`User: ${this.name}, Email: ${this.email}`);
  }
}

// Problem: If database changes, email service changes, 
// validation rules change, or logging format changes,
// this class needs to be modified
```

### Correct Implementation

```javascript
// ✅ GOOD: Single responsibility per class

// Responsibility 1: User data model
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

// Responsibility 2: User validation
class UserValidator {
  validate(user) {
    if (!user.name || user.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (!user.email || !user.email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}

// Responsibility 3: User persistence
class UserRepository {
  async save(user) {
    await db.query('INSERT INTO users (name, email) VALUES ($1, $2)', 
      [user.name, user.email]);
  }
  
  async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
}

// Responsibility 4: Email service
class EmailService {
  async sendEmail(to, subject, body) {
    await emailService.send(to, subject, body);
  }
}

// Responsibility 5: Logging
class Logger {
  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

// Usage
const user = new User('John Doe', 'john@example.com');
const validator = new UserValidator();
const repository = new UserRepository();
const emailService = new EmailService();
const logger = new Logger();

validator.validate(user);
await repository.save(user);
await emailService.sendEmail(user.email, 'Welcome', 'Welcome to our app!');
logger.log(`User ${user.name} created`);
```

### Real-World Example: Express Route Handler

**Violation:**
```javascript
// ❌ BAD: Route handler does everything
app.post('/users', async (req, res) => {
  // Validation
  if (!req.body.email || !req.body.email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  // Business logic
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
  // Database operation
  const result = await db.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
    [req.body.name, req.body.email, hashedPassword]
  );
  
  // Email sending
  await emailService.send(req.body.email, 'Welcome', 'Welcome!');
  
  // Logging
  console.log(`New user created: ${req.body.email}`);
  
  // Response
  res.status(201).json({ id: result.rows[0].id });
});
```

**Correct:**
```javascript
// ✅ GOOD: Separated responsibilities

// Validation middleware
const validateUser = [
  body('email').isEmail(),
  body('name').isLength({ min: 2 }),
  body('password').isLength({ min: 8 })
];

// Service layer (business logic)
class UserService {
  constructor(userRepository, emailService, logger) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.logger = logger;
  }
  
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });
    
    await this.emailService.sendWelcomeEmail(user.email);
    this.logger.log(`User created: ${user.email}`);
    
    return user;
  }
}

// Repository (data access)
class UserRepository {
  async create(userData) {
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [userData.name, userData.email, userData.password]
    );
    return result.rows[0];
  }
}

// Controller (handles HTTP)
app.post('/users', validateUser, async (req, res) => {
  try {
    const userService = new UserService(
      new UserRepository(),
      new EmailService(),
      new Logger()
    );
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Open/Closed Principle (OCP)

### Definition

**Standard Answer:**
Software entities should be open for extension but closed for modification. You should be able to add new functionality without changing existing code.

**Simple Explanation:**
Like a power outlet - you can plug in new devices (extend) without modifying the outlet itself (closed for modification).

### Violation Example

```javascript
// ❌ BAD: Must modify class to add new types
class AreaCalculator {
  calculateArea(shape) {
    if (shape.type === 'rectangle') {
      return shape.width * shape.height;
    } else if (shape.type === 'circle') {
      return Math.PI * shape.radius * shape.radius;
    } else if (shape.type === 'triangle') {
      return 0.5 * shape.base * shape.height;
    }
    // Must modify this class to add new shapes
  }
}
```

### Correct Implementation

```javascript
// ✅ GOOD: Open for extension, closed for modification

// Base class/interface
class Shape {
  calculateArea() {
    throw new Error('Method must be implemented');
  }
}

// Extensions (don't modify base class)
class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  
  calculateArea() {
    return this.width * this.height;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  
  calculateArea() {
    return Math.PI * this.radius * this.radius;
  }
}

class Triangle extends Shape {
  constructor(base, height) {
    super();
    this.base = base;
    this.height = height;
  }
  
  calculateArea() {
    return 0.5 * this.base * this.height;
  }
}

// Calculator doesn't need modification for new shapes
class AreaCalculator {
  calculateTotalArea(shapes) {
    return shapes.reduce((total, shape) => {
      return total + shape.calculateArea();
    }, 0);
  }
}

// Usage
const shapes = [
  new Rectangle(10, 5),
  new Circle(3),
  new Triangle(4, 6)
];

const calculator = new AreaCalculator();
const totalArea = calculator.calculateTotalArea(shapes);
```

### Real-World Example: Payment Processing

**Violation:**
```javascript
// ❌ BAD: Must modify to add new payment methods
class PaymentProcessor {
  processPayment(amount, method) {
    if (method === 'credit_card') {
      // Credit card processing
      return creditCardService.charge(amount);
    } else if (method === 'paypal') {
      // PayPal processing
      return paypalService.pay(amount);
    } else if (method === 'stripe') {
      // Stripe processing
      return stripeService.charge(amount);
    }
    // Must modify this class for new payment methods
  }
}
```

**Correct:**
```javascript
// ✅ GOOD: Strategy pattern - open for extension

// Payment interface
class PaymentMethod {
  async process(amount) {
    throw new Error('Method must be implemented');
  }
}

// Concrete implementations
class CreditCardPayment extends PaymentMethod {
  async process(amount) {
    return await creditCardService.charge(amount);
  }
}

class PayPalPayment extends PaymentMethod {
  async process(amount) {
    return await paypalService.pay(amount);
  }
}

class StripePayment extends PaymentMethod {
  async process(amount) {
    return await stripeService.charge(amount);
  }
}

// Processor doesn't need modification
class PaymentProcessor {
  constructor(paymentMethod) {
    this.paymentMethod = paymentMethod;
  }
  
  async processPayment(amount) {
    return await this.paymentMethod.process(amount);
  }
}

// Usage - can add new payment methods without modifying processor
const processor = new PaymentProcessor(new CreditCardPayment());
await processor.processPayment(100);

// Add new payment method without modifying existing code
class CryptoPayment extends PaymentMethod {
  async process(amount) {
    return await cryptoService.transfer(amount);
  }
}

const cryptoProcessor = new PaymentProcessor(new CryptoPayment());
await cryptoProcessor.processPayment(100);
```

---

## Liskov Substitution Principle (LSP)

### Definition

**Standard Answer:**
Objects of a superclass should be replaceable with objects of its subclasses without breaking the application. Subclasses should behave in a way that doesn't violate the expectations set by the base class.

**Simple Explanation:**
If you have a base class (like "Bird") and a subclass (like "Penguin"), you should be able to use a Penguin anywhere you use a Bird, and it should work correctly. However, if Penguin can't fly but Bird is expected to fly, that violates LSP.

### Violation Example

```javascript
// ❌ BAD: Violates LSP
class Bird {
  fly() {
    return 'Flying';
  }
}

class Sparrow extends Bird {
  fly() {
    return 'Flying';
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error('Penguins cannot fly!'); // Violates LSP
  }
}

// This breaks - can't substitute Penguin for Bird
function makeBirdFly(bird) {
  return bird.fly(); // Crashes if bird is Penguin
}

const penguin = new Penguin();
makeBirdFly(penguin); // Error!
```

### Correct Implementation

```javascript
// ✅ GOOD: Proper inheritance hierarchy

class Bird {
  move() {
    return 'Moving';
  }
}

class FlyingBird extends Bird {
  fly() {
    return 'Flying';
  }
  
  move() {
    return this.fly();
  }
}

class NonFlyingBird extends Bird {
  walk() {
    return 'Walking';
  }
  
  move() {
    return this.walk();
  }
}

class Sparrow extends FlyingBird {
  fly() {
    return 'Flying';
  }
}

class Penguin extends NonFlyingBird {
  walk() {
    return 'Walking';
  }
}

// Now all birds can be used interchangeably
function makeBirdMove(bird) {
  return bird.move(); // Works for all bird types
}

const sparrow = new Sparrow();
const penguin = new Penguin();

makeBirdMove(sparrow); // 'Flying'
makeBirdMove(penguin); // 'Walking'
```

### Real-World Example: Database Connections

**Violation:**
```javascript
// ❌ BAD: Violates LSP
class DatabaseConnection {
  connect() {
    return 'Connected';
  }
  
  query(sql) {
    return 'Query result';
  }
}

class PostgreSQLConnection extends DatabaseConnection {
  connect() {
    return 'PostgreSQL connected';
  }
  
  query(sql) {
    return 'PostgreSQL query result';
  }
}

class ReadOnlyConnection extends DatabaseConnection {
  connect() {
    return 'Connected';
  }
  
  query(sql) {
    if (sql.includes('INSERT') || sql.includes('UPDATE') || sql.includes('DELETE')) {
      throw new Error('Read-only connection cannot modify data'); // Violates LSP
    }
    return 'Query result';
  }
}

// Breaks - ReadOnlyConnection can't be substituted
function executeQuery(connection, sql) {
  return connection.query(sql); // May throw error
}
```

**Correct:**
```javascript
// ✅ GOOD: Proper interface segregation

class DatabaseConnection {
  connect() {
    throw new Error('Must be implemented');
  }
  
  query(sql) {
    throw new Error('Must be implemented');
  }
}

class ReadWriteConnection extends DatabaseConnection {
  connect() {
    return 'Connected';
  }
  
  query(sql) {
    return 'Query result';
  }
  
  execute(sql) {
    return 'Execute result';
  }
}

class ReadOnlyConnection extends DatabaseConnection {
  connect() {
    return 'Connected';
  }
  
  query(sql) {
    // Only allows SELECT queries
    if (!sql.trim().toUpperCase().startsWith('SELECT')) {
      throw new Error('Read-only connection');
    }
    return 'Query result';
  }
  
  // No execute method - read-only
}

// Now both can be used where DatabaseConnection is expected
function executeReadQuery(connection, sql) {
  return connection.query(sql); // Works for both
}
```

---

## Interface Segregation Principle (ISP)

### Definition

**Standard Answer:**
Clients should not be forced to depend on interfaces they don't use. Many specific interfaces are better than one general-purpose interface.

**Simple Explanation:**
Like tools - you don't want a Swiss Army knife that does everything poorly. Better to have specific tools for specific tasks. Don't force a class to implement methods it doesn't need.

### Violation Example

```javascript
// ❌ BAD: Fat interface - forces implementation of unused methods
class Worker {
  work() {
    throw new Error('Must be implemented');
  }
  
  eat() {
    throw new Error('Must be implemented');
  }
  
  sleep() {
    throw new Error('Must be implemented');
  }
}

class Human extends Worker {
  work() {
    return 'Working';
  }
  
  eat() {
    return 'Eating';
  }
  
  sleep() {
    return 'Sleeping';
  }
}

class Robot extends Worker {
  work() {
    return 'Working';
  }
  
  eat() {
    throw new Error('Robots don\'t eat!'); // Forced to implement
  }
  
  sleep() {
    throw new Error('Robots don\'t sleep!'); // Forced to implement
  }
}
```

### Correct Implementation

```javascript
// ✅ GOOD: Segregated interfaces

// Specific interfaces
class Workable {
  work() {
    throw new Error('Must be implemented');
  }
}

class Eatable {
  eat() {
    throw new Error('Must be implemented');
  }
}

class Sleepable {
  sleep() {
    throw new Error('Must be implemented');
  }
}

// Classes implement only what they need
class Human extends Workable {
  work() {
    return 'Working';
  }
}

// Mixin pattern for multiple interfaces
Object.assign(Human.prototype, {
  eat() {
    return 'Eating';
  },
  sleep() {
    return 'Sleeping';
  }
});

class Robot extends Workable {
  work() {
    return 'Working';
  }
  // No need to implement eat() or sleep()
}

// Usage
function makeWork(worker) {
  return worker.work(); // Only needs Workable interface
}

function makeEat(eater) {
  return eater.eat(); // Only needs Eatable interface
}
```

### Real-World Example: Notification System

**Violation:**
```javascript
// ❌ BAD: Fat interface
class NotificationService {
  sendEmail(to, message) {
    throw new Error('Must be implemented');
  }
  
  sendSMS(to, message) {
    throw new Error('Must be implemented');
  }
  
  sendPush(to, message) {
    throw new Error('Must be implemented');
  }
  
  sendSlack(channel, message) {
    throw new Error('Must be implemented');
  }
}

// Must implement all methods even if only using one
class EmailNotifier extends NotificationService {
  sendEmail(to, message) {
    return emailService.send(to, message);
  }
  
  sendSMS() {
    throw new Error('Not supported');
  }
  
  sendPush() {
    throw new Error('Not supported');
  }
  
  sendSlack() {
    throw new Error('Not supported');
  }
}
```

**Correct:**
```javascript
// ✅ GOOD: Segregated interfaces

// Specific interfaces
class EmailNotifier {
  async sendEmail(to, message) {
    throw new Error('Must be implemented');
  }
}

class SMSNotifier {
  async sendSMS(to, message) {
    throw new Error('Must be implemented');
  }
}

class PushNotifier {
  async sendPush(to, message) {
    throw new Error('Must be implemented');
  }
}

// Concrete implementations
class EmailService extends EmailNotifier {
  async sendEmail(to, message) {
    return await emailService.send(to, message);
  }
}

class SMSService extends SMSNotifier {
  async sendSMS(to, message) {
    return await smsService.send(to, message);
  }
}

// Multi-channel notifier (implements multiple interfaces)
class MultiChannelNotifier {
  constructor(emailService, smsService, pushService) {
    this.emailService = emailService;
    this.smsService = smsService;
    this.pushService = pushService;
  }
  
  async sendEmail(to, message) {
    return await this.emailService.sendEmail(to, message);
  }
  
  async sendSMS(to, message) {
    return await this.smsService.sendSMS(to, message);
  }
  
  async sendPush(to, message) {
    return await this.pushService.sendPush(to, message);
  }
}

// Usage - only depend on what you need
async function sendWelcomeEmail(notifier, email) {
  return await notifier.sendEmail(email, 'Welcome!');
  // Only needs EmailNotifier interface
}
```

---

## Dependency Inversion Principle (DIP)

### Definition

**Standard Answer:**
High-level modules should not depend on low-level modules. Both should depend on abstractions (interfaces). Depend on abstractions, not concretions.

**Simple Explanation:**
Don't depend on specific implementations. Depend on interfaces/abstractions. Like depending on "payment method" interface, not "credit card" specifically. This allows easy swapping of implementations.

### Violation Example

```javascript
// ❌ BAD: High-level depends on low-level
class UserService {
  constructor() {
    // Direct dependency on concrete implementation
    this.emailService = new EmailService();
    this.logger = new ConsoleLogger();
    this.userRepository = new PostgreSQLUserRepository();
  }
  
  async createUser(userData) {
    const user = await this.userRepository.save(userData);
    await this.emailService.send(user.email, 'Welcome');
    this.logger.log(`User created: ${user.email}`);
    return user;
  }
}

// Problem: Can't easily swap implementations
// Tightly coupled to specific services
```

### Correct Implementation

```javascript
// ✅ GOOD: Depend on abstractions

// Abstractions (interfaces)
class IUserRepository {
  async save(userData) {
    throw new Error('Must be implemented');
  }
  
  async findById(id) {
    throw new Error('Must be implemented');
  }
}

class IEmailService {
  async sendEmail(to, subject, body) {
    throw new Error('Must be implemented');
  }
}

class ILogger {
  log(message) {
    throw new Error('Must be implemented');
  }
}

// Concrete implementations
class PostgreSQLUserRepository extends IUserRepository {
  async save(userData) {
    return await db.query('INSERT INTO users...');
  }
  
  async findById(id) {
    return await db.query('SELECT * FROM users WHERE id = $1', [id]);
  }
}

class MongoDBUserRepository extends IUserRepository {
  async save(userData) {
    return await User.create(userData);
  }
  
  async findById(id) {
    return await User.findById(id);
  }
}

class EmailService extends IEmailService {
  async sendEmail(to, subject, body) {
    return await emailService.send(to, subject, body);
  }
}

class ConsoleLogger extends ILogger {
  log(message) {
    console.log(message);
  }
}

class FileLogger extends ILogger {
  log(message) {
    fs.appendFileSync('log.txt', message + '\n');
  }
}

// High-level module depends on abstractions
class UserService {
  constructor(userRepository, emailService, logger) {
    // Depend on interfaces, not concrete classes
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.logger = logger;
  }
  
  async createUser(userData) {
    const user = await this.userRepository.save(userData);
    await this.emailService.sendEmail(user.email, 'Welcome', 'Welcome!');
    this.logger.log(`User created: ${user.email}`);
    return user;
  }
}

// Usage - can easily swap implementations
const userService1 = new UserService(
  new PostgreSQLUserRepository(),
  new EmailService(),
  new ConsoleLogger()
);

const userService2 = new UserService(
  new MongoDBUserRepository(),
  new EmailService(),
  new FileLogger()
);

// Both work the same way - depends on abstractions
```

### Real-World Example: Express Application

**Violation:**
```javascript
// ❌ BAD: Direct dependencies
const express = require('express');
const app = express();

// Directly using specific services
const db = require('./postgres-db');
const emailService = require('./sendgrid-email');

app.post('/users', async (req, res) => {
  const user = await db.query('INSERT INTO users...');
  await emailService.send(user.email, 'Welcome');
  res.json(user);
});

// Problem: Hard to test, hard to swap implementations
```

**Correct:**
```javascript
// ✅ GOOD: Dependency injection

// Abstractions
class IUserRepository {
  async create(userData) {
    throw new Error('Must be implemented');
  }
}

class IEmailService {
  async sendWelcomeEmail(email) {
    throw new Error('Must be implemented');
  }
}

// Implementations
class PostgreSQLUserRepository extends IUserRepository {
  async create(userData) {
    return await db.query('INSERT INTO users...');
  }
}

class SendGridEmailService extends IEmailService {
  async sendWelcomeEmail(email) {
    return await sendgrid.send(email, 'Welcome', 'Welcome!');
  }
}

// Service depends on abstractions
class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }
  
  async createUser(userData) {
    const user = await this.userRepository.create(userData);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}

// Dependency injection container
class Container {
  constructor() {
    this.services = {};
  }
  
  register(name, factory) {
    this.services[name] = factory;
  }
  
  get(name) {
    return this.services[name]();
  }
}

const container = new Container();
container.register('userRepository', () => new PostgreSQLUserRepository());
container.register('emailService', () => new SendGridEmailService());
container.register('userService', () => 
  new UserService(
    container.get('userRepository'),
    container.get('emailService')
  )
);

// Express route
app.post('/users', async (req, res) => {
  const userService = container.get('userService');
  const user = await userService.createUser(req.body);
  res.json(user);
});

// Easy to swap implementations for testing
container.register('userRepository', () => new MockUserRepository());
container.register('emailService', () => new MockEmailService());
```

---

## Real-World Examples

### Example 1: E-commerce Order Processing

**Applying SOLID:**
```javascript
// Single Responsibility
class OrderValidator {
  validate(order) {
    // Only validates
  }
}

class OrderCalculator {
  calculateTotal(order) {
    // Only calculates
  }
}

class OrderRepository {
  async save(order) {
    // Only saves
  }
}

// Open/Closed - can add new payment methods
class PaymentMethod {
  process(amount) {}
}

class CreditCardPayment extends PaymentMethod {}
class PayPalPayment extends PaymentMethod {}

// Dependency Inversion
class OrderService {
  constructor(
    validator,
    calculator,
    repository,
    paymentMethod
  ) {
    // Depend on abstractions
  }
}
```

### Example 2: API Authentication

**Applying SOLID:**
```javascript
// Single Responsibility
class TokenGenerator {
  generate(user) {}
}

class TokenValidator {
  validate(token) {}
}

// Open/Closed - can add new auth strategies
class AuthStrategy {
  authenticate(credentials) {}
}

class JWTAuthStrategy extends AuthStrategy {}
class OAuthAuthStrategy extends AuthStrategy {}

// Dependency Inversion
class AuthService {
  constructor(strategy) {
    this.strategy = strategy; // Depends on abstraction
  }
}
```

---

## Interview Questions

### Q1: Explain SOLID principles

**Standard Answer:**
SOLID is five principles for object-oriented design:
1. **SRP**: One class, one responsibility
2. **OCP**: Open for extension, closed for modification
3. **LSP**: Subclasses must be substitutable for base classes
4. **ISP**: Many specific interfaces better than one general
5. **DIP**: Depend on abstractions, not concretions

### Q2: Give an example of SRP violation and fix

**Standard Answer:**
```javascript
// Violation: User class does validation, saving, emailing
class User {
  validate() {}
  save() {}
  sendEmail() {}
}

// Fix: Separate classes
class UserValidator {}
class UserRepository {}
class EmailService {}
```

### Q3: How does DIP help with testing?

**Standard Answer:**
DIP allows injecting mock dependencies, making unit testing easier. Instead of depending on real database, depend on repository interface, then inject mock repository for tests.

### Q4: Explain OCP with example

**Standard Answer:**
OCP means you can extend functionality without modifying existing code. Example: Payment processing - add new payment method (extend) without modifying payment processor (closed for modification).

---

This comprehensive guide covers SOLID principles with practical Node.js examples. Practice applying these principles in your code!

