# SQL and MongoDB - Complete Guide for Node.js Developers

## Table of Contents
1. [SQL Fundamentals](#sql-fundamentals)
2. [PostgreSQL with Node.js](#postgresql-with-nodejs)
3. [MongoDB Fundamentals](#mongodb-fundamentals)
4. [MongoDB with Node.js](#mongodb-with-nodejs)
5. [SQL vs MongoDB Comparison](#sql-vs-mongodb-comparison)
6. [Interview Questions](#interview-questions)

---

## SQL Fundamentals

### What is SQL?

**Standard Answer:**
SQL (Structured Query Language) is a domain-specific language used for managing and manipulating relational databases. It allows you to create, read, update, and delete data in a structured, table-based format.

**Key Concepts:**
- **Relational**: Data stored in tables with relationships
- **ACID**: Atomicity, Consistency, Isolation, Durability
- **Schema**: Fixed structure defined before data insertion
- **Normalization**: Organizing data to reduce redundancy

### Basic SQL Operations

**CREATE TABLE**
```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table with foreign key
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**INSERT**
```sql
-- Insert single record
INSERT INTO users (name, email, age) 
VALUES ('John Doe', 'john@example.com', 30);

-- Insert multiple records
INSERT INTO users (name, email, age) 
VALUES 
  ('Jane Smith', 'jane@example.com', 25),
  ('Bob Johnson', 'bob@example.com', 35);

-- Insert with returning (get inserted data)
INSERT INTO users (name, email, age)
VALUES ('Alice Brown', 'alice@example.com', 28)
RETURNING *;
```

**SELECT**
```sql
-- Select all columns
SELECT * FROM users;

-- Select specific columns
SELECT name, email FROM users;

-- Select with WHERE clause
SELECT * FROM users WHERE age > 25;

-- Select with multiple conditions
SELECT * FROM users 
WHERE age > 25 AND email LIKE '%@example.com';

-- Select with ORDER BY
SELECT * FROM users ORDER BY created_at DESC;

-- Select with LIMIT and OFFSET (pagination)
SELECT * FROM users 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 20; -- Skip 20, take 10
```

**UPDATE**
```sql
-- Update single record
UPDATE users 
SET age = 31, name = 'John Updated'
WHERE id = 1;

-- Update multiple records
UPDATE users 
SET age = age + 1
WHERE age < 30;

-- Update with returning
UPDATE users 
SET age = 31
WHERE id = 1
RETURNING *;
```

**DELETE**
```sql
-- Delete specific record
DELETE FROM users WHERE id = 1;

-- Delete with condition
DELETE FROM users WHERE age < 18;

-- Delete all (dangerous!)
DELETE FROM users;
```

### Advanced SQL Queries

**JOINS**
```sql
-- INNER JOIN (only matching records)
SELECT users.name, posts.title
FROM users
INNER JOIN posts ON users.id = posts.user_id;

-- LEFT JOIN (all users, even without posts)
SELECT users.name, posts.title
FROM users
LEFT JOIN posts ON users.id = posts.user_id;

-- RIGHT JOIN (all posts, even without users)
SELECT users.name, posts.title
FROM users
RIGHT JOIN posts ON users.id = posts.user_id;

-- FULL OUTER JOIN (all records from both tables)
SELECT users.name, posts.title
FROM users
FULL OUTER JOIN posts ON users.id = posts.user_id;

-- Multiple JOINs
SELECT users.name, posts.title, comments.content
FROM users
INNER JOIN posts ON users.id = posts.user_id
LEFT JOIN comments ON posts.id = comments.post_id;
```

**AGGREGATION**
```sql
-- COUNT
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM users WHERE age > 25;

-- SUM, AVG, MIN, MAX
SELECT 
  COUNT(*) as total_users,
  AVG(age) as average_age,
  MIN(age) as min_age,
  MAX(age) as max_age,
  SUM(age) as total_age
FROM users;

-- GROUP BY
SELECT age, COUNT(*) as count
FROM users
GROUP BY age
ORDER BY count DESC;

-- HAVING (filter after GROUP BY)
SELECT age, COUNT(*) as count
FROM users
GROUP BY age
HAVING COUNT(*) > 5;
```

**SUBQUERIES**
```sql
-- Subquery in WHERE
SELECT * FROM users
WHERE age > (SELECT AVG(age) FROM users);

-- Subquery in SELECT
SELECT 
  name,
  (SELECT COUNT(*) FROM posts WHERE posts.user_id = users.id) as post_count
FROM users;

-- EXISTS
SELECT * FROM users
WHERE EXISTS (
  SELECT 1 FROM posts WHERE posts.user_id = users.id
);

-- IN
SELECT * FROM users
WHERE id IN (SELECT user_id FROM posts);
```

**INDEXES**
```sql
-- Create index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_age ON users(age);

-- Composite index
CREATE INDEX idx_users_name_email ON users(name, email);

-- Unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Drop index
DROP INDEX idx_users_email;
```

**TRANSACTIONS**
```sql
-- Begin transaction
BEGIN;

-- Multiple operations
UPDATE users SET balance = balance - 100 WHERE id = 1;
UPDATE users SET balance = balance + 100 WHERE id = 2;

-- Commit (save changes)
COMMIT;

-- Or rollback (undo changes)
ROLLBACK;

-- Example with error handling
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
  
  -- If any error occurs, rollback
  -- Otherwise commit
COMMIT;
```

---

## PostgreSQL with Node.js

### Using pg (node-postgres)

**Basic Connection**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  user: 'myuser',
  password: 'mypassword',
  port: 5432,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res);
});
```

**CRUD Operations**
```javascript
// CREATE
async function createUser(name, email, age) {
  const query = `
    INSERT INTO users (name, email, age)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await pool.query(query, [name, email, age]);
  return result.rows[0];
}

// READ
async function getUserById(id) {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

async function getAllUsers() {
  const query = 'SELECT * FROM users ORDER BY created_at DESC';
  const result = await pool.query(query);
  return result.rows;
}

// UPDATE
async function updateUser(id, updates) {
  const setClause = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');
  const query = `
    UPDATE users 
    SET ${setClause}
    WHERE id = $1
    RETURNING *
  `;
  const values = [id, ...Object.values(updates)];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// DELETE
async function deleteUser(id) {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
}
```

**Transactions**
```javascript
async function transferMoney(fromId, toId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Deduct from sender
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromId]
    );
    
    // Add to receiver
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toId]
    );
    
    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

**Complex Queries**
```javascript
// JOIN query
async function getUserWithPosts(userId) {
  const query = `
    SELECT 
      users.*,
      json_agg(posts.*) as posts
    FROM users
    LEFT JOIN posts ON users.id = posts.user_id
    WHERE users.id = $1
    GROUP BY users.id
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
}

// Pagination
async function getUsersPaginated(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const query = `
    SELECT * FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const countQuery = 'SELECT COUNT(*) FROM users';
  
  const [dataResult, countResult] = await Promise.all([
    pool.query(query, [limit, offset]),
    pool.query(countQuery)
  ]);
  
  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit
  };
}
```

### Using Sequelize ORM

**Setup**
```javascript
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
```

**Models**
```javascript
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
    unique: true,
    validate: {
      isEmail: true
    }
  },
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 120
    }
  }
}, {
  tableName: 'users',
  timestamps: true
});

const Post = sequelize.define('Post', {
  title: DataTypes.STRING,
  content: DataTypes.TEXT
});

// Associations
User.hasMany(Post, { foreignKey: 'user_id' });
Post.belongsTo(User, { foreignKey: 'user_id' });
```

**CRUD with Sequelize**
```javascript
// CREATE
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// READ
const user = await User.findByPk(1);
const users = await User.findAll();
const user = await User.findOne({ where: { email: 'john@example.com' } });

// UPDATE
await user.update({ age: 31 });
await User.update(
  { age: 31 },
  { where: { id: 1 } }
);

// DELETE
await user.destroy();
await User.destroy({ where: { age: { [Op.lt]: 18 } } });
```

---

## MongoDB Fundamentals

### What is MongoDB?

**Standard Answer:**
MongoDB is a NoSQL document database that stores data in flexible, JSON-like documents. Unlike SQL databases, MongoDB is schema-less, meaning documents in a collection can have different structures.

**Key Concepts:**
- **Document**: BSON (Binary JSON) object, like a row in SQL
- **Collection**: Group of documents, like a table in SQL
- **Database**: Container for collections
- **Schema-less**: No fixed structure required

### Basic MongoDB Operations

**Create Database and Collection**
```javascript
// MongoDB automatically creates database and collection on first insert
use mydb; // Switch to database (or create if doesn't exist)
```

**INSERT**
```javascript
// Insert single document
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  createdAt: new Date()
});

// Insert multiple documents
db.users.insertMany([
  { name: "Jane Smith", email: "jane@example.com", age: 25 },
  { name: "Bob Johnson", email: "bob@example.com", age: 35 }
]);
```

**FIND**
```javascript
// Find all documents
db.users.find();

// Find with filter
db.users.find({ age: { $gt: 25 } });

// Find one
db.users.findOne({ email: "john@example.com" });

// Projection (select specific fields)
db.users.find({}, { name: 1, email: 1 }); // Only name and email

// Sort
db.users.find().sort({ age: -1 }); // Descending

// Limit and Skip (pagination)
db.users.find().skip(10).limit(10);
```

**UPDATE**
```javascript
// Update one
db.users.updateOne(
  { email: "john@example.com" },
  { $set: { age: 31 } }
);

// Update many
db.users.updateMany(
  { age: { $lt: 18 } },
  { $set: { status: "minor" } }
);

// Replace document
db.users.replaceOne(
  { email: "john@example.com" },
  { name: "John Updated", email: "john@example.com", age: 31 }
);
```

**DELETE**
```javascript
// Delete one
db.users.deleteOne({ email: "john@example.com" });

// Delete many
db.users.deleteMany({ age: { $lt: 18 } });

// Delete all (dangerous!)
db.users.deleteMany({});
```

### MongoDB Query Operators

**Comparison Operators**
```javascript
// $gt, $gte, $lt, $lte, $ne, $in, $nin
db.users.find({ age: { $gt: 25 } });
db.users.find({ age: { $gte: 18, $lte: 65 } });
db.users.find({ status: { $in: ["active", "pending"] } });
db.users.find({ status: { $ne: "deleted" } });
```

**Logical Operators**
```javascript
// $and, $or, $not, $nor
db.users.find({
  $and: [
    { age: { $gt: 18 } },
    { status: "active" }
  ]
});

db.users.find({
  $or: [
    { age: { $lt: 18 } },
    { age: { $gt: 65 } }
  ]
});
```

**Array Operators**
```javascript
// $all, $elemMatch, $size
db.users.find({ tags: { $all: ["developer", "nodejs"] } });
db.users.find({ 
  skills: { 
    $elemMatch: { name: "JavaScript", level: "expert" } 
  } 
});
db.users.find({ tags: { $size: 3 } });
```

**Text Search**
```javascript
// Create text index
db.users.createIndex({ name: "text", email: "text" });

// Text search
db.users.find({ $text: { $search: "john" } });
```

### Aggregation Pipeline

**Basic Aggregation**
```javascript
// $match, $group, $sort, $project, $limit
db.users.aggregate([
  { $match: { age: { $gte: 18 } } },
  { $group: { 
      _id: "$status", 
      count: { $sum: 1 },
      avgAge: { $avg: "$age" }
    }
  },
  { $sort: { count: -1 } }
]);
```

**Complex Aggregation**
```javascript
db.orders.aggregate([
  // Match stage
  { $match: { status: "completed" } },
  
  // Lookup (join)
  { $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  
  // Unwind array
  { $unwind: "$user" },
  
  // Group
  { $group: {
      _id: "$user.name",
      totalOrders: { $sum: 1 },
      totalAmount: { $sum: "$amount" }
    }
  },
  
  // Project
  { $project: {
      userName: "$_id",
      totalOrders: 1,
      totalAmount: 1,
      _id: 0
    }
  },
  
  // Sort
  { $sort: { totalAmount: -1 } },
  
  // Limit
  { $limit: 10 }
]);
```

---

## MongoDB with Node.js

### Using Mongoose

**Connection**
```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
```

**Schema Definition**
```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [120, 'Age cannot exceed 120']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  tags: [String],
  address: {
    street: String,
    city: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ name: 'text', email: 'text' });
userSchema.index({ status: 1, createdAt: -1 });

const User = mongoose.model('User', userSchema);
```

**CRUD Operations**
```javascript
// CREATE
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Or
const user = new User({ name: 'John', email: 'john@example.com' });
await user.save();

// READ
const user = await User.findById(userId);
const user = await User.findOne({ email: 'john@example.com' });
const users = await User.find({ age: { $gte: 18 } });
const users = await User.find().select('name email'); // Only specific fields

// UPDATE
await User.findByIdAndUpdate(userId, { age: 31 }, { new: true });
await User.updateMany({ age: { $lt: 18 } }, { status: 'minor' });

// DELETE
await User.findByIdAndDelete(userId);
await User.deleteMany({ status: 'inactive' });
```

**Advanced Queries**
```javascript
// Pagination
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;
const users = await User.find()
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });

// Populate (like JOIN)
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Post = mongoose.model('Post', postSchema);

const posts = await Post.find().populate('authorId');

// Aggregation
const stats = await User.aggregate([
  { $match: { status: 'active' } },
  { $group: {
      _id: '$status',
      count: { $sum: 1 },
      avgAge: { $avg: '$age' }
    }
  }
]);
```

---

## SQL vs MongoDB Comparison

| Feature | SQL (PostgreSQL) | MongoDB |
|---------|------------------|---------|
| **Data Model** | Relational (tables) | Document (collections) |
| **Schema** | Fixed schema | Schema-less |
| **Query Language** | SQL | JavaScript-like queries |
| **Joins** | Native JOIN support | $lookup (aggregation) |
| **Transactions** | Full ACID support | Multi-document transactions (v4.0+) |
| **Scalability** | Vertical + Horizontal | Horizontal (sharding) |
| **Use Case** | Structured data, complex relationships | Flexible schema, rapid development |
| **Performance** | Optimized for complex queries | Optimized for read-heavy workloads |

**When to Use SQL:**
- Complex relationships between data
- ACID compliance is critical
- Structured, consistent data
- Complex queries with joins
- Financial transactions

**When to Use MongoDB:**
- Rapid development, changing schema
- Document-based data (JSON-like)
- Horizontal scaling needed
- Content management systems
- Real-time analytics

---

## Interview Questions

### Q1: Explain the difference between SQL and NoSQL databases

**Standard Answer:**
SQL databases are relational, use structured schemas, and support ACID transactions. NoSQL databases are non-relational, schema-less, and prioritize flexibility and scalability. SQL is better for complex relationships, NoSQL for flexible, rapidly changing data.

### Q2: How do you optimize SQL queries?

**Standard Answer:**
1. Use indexes on frequently queried columns
2. Avoid SELECT * (select only needed columns)
3. Use EXPLAIN to analyze query plans
4. Optimize JOINs (ensure foreign keys are indexed)
5. Use pagination for large result sets
6. Avoid N+1 queries (use JOINs or subqueries)

### Q3: Explain MongoDB aggregation pipeline

**Standard Answer:**
Aggregation pipeline processes documents through stages. Each stage transforms documents and passes results to next stage. Common stages: $match (filter), $group (aggregate), $sort, $project (select fields), $lookup (join), $unwind (flatten arrays).

### Q4: How do you handle transactions in MongoDB?

**Standard Answer:**
MongoDB supports multi-document transactions (v4.0+). Use sessions to group operations:

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await User.create([{ name: 'John' }], { session });
  await Account.updateOne({ userId: userId }, { $inc: { balance: 100 } }, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

This comprehensive guide covers SQL and MongoDB from basics to advanced topics with Node.js integration. Practice these concepts with real examples!

