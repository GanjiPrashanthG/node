# SQL Injection Prevention - Complete Guide

## Table of Contents
1. [What is SQL Injection?](#what-is-sql-injection)
2. [Types of SQL Injection](#types-of-sql-injection)
3. [Prevention Techniques](#prevention-techniques)
4. [Node.js Examples](#nodejs-examples)
5. [Best Practices](#best-practices)
6. [Real-World Examples](#real-world-examples)

---

## What is SQL Injection?

### Standard Answer

**SQL Injection** is a code injection technique where malicious SQL code is inserted into an application's database query. Attackers exploit vulnerabilities in input validation to execute unauthorized database commands.

**Simple Explanation:**
Think of SQL injection like someone sneaking a fake order into a restaurant's order system. Instead of ordering food, they write malicious instructions that the system executes, potentially accessing or destroying data.

**Impact:**
- Unauthorized data access
- Data deletion or modification
- Authentication bypass
- Database structure exposure
- Complete database compromise

---

## Types of SQL Injection

### 1. Classic SQL Injection

**Vulnerable Code:**
```javascript
// ❌ VULNERABLE: Direct string concatenation
const email = req.body.email;
const query = `SELECT * FROM users WHERE email = '${email}'`;
// If email = "admin' OR '1'='1"
// Query becomes: SELECT * FROM users WHERE email = 'admin' OR '1'='1'
// Returns all users!
```

**Attack Example:**
```sql
-- Input: admin' OR '1'='1
-- Resulting Query:
SELECT * FROM users WHERE email = 'admin' OR '1'='1'
-- Returns all users because '1'='1' is always true
```

### 2. Union-Based Injection

**Vulnerable Code:**
```javascript
// ❌ VULNERABLE
const search = req.query.search;
const query = `SELECT name, email FROM users WHERE name LIKE '%${search}%'`;
```

**Attack Example:**
```sql
-- Input: ' UNION SELECT password, credit_card FROM users--
-- Resulting Query:
SELECT name, email FROM users WHERE name LIKE '%' UNION SELECT password, credit_card FROM users--%'
-- Exposes sensitive data from other columns
```

### 3. Boolean-Based Blind Injection

**Vulnerable Code:**
```javascript
// ❌ VULNERABLE
const id = req.params.id;
const query = `SELECT * FROM users WHERE id = ${id}`;
```

**Attack Example:**
```sql
-- Input: 1 AND 1=1 (returns data)
-- Input: 1 AND 1=2 (returns nothing)
-- Attacker can infer database structure by testing conditions
```

### 4. Time-Based Blind Injection

**Vulnerable Code:**
```javascript
// ❌ VULNERABLE
const id = req.params.id;
const query = `SELECT * FROM users WHERE id = ${id}`;
```

**Attack Example:**
```sql
-- Input: 1; WAITFOR DELAY '00:00:05'--
-- If query takes 5 seconds, condition is true
-- Attacker can extract data by measuring response times
```

### 5. Second-Order Injection

**Vulnerable Code:**
```javascript
// ❌ VULNERABLE: Stored data later used unsafely
const username = req.body.username; // Stored as-is
// Later used in query without sanitization
const query = `SELECT * FROM users WHERE username = '${username}'`;
```

**Attack:**
- Malicious input stored in database
- Later retrieved and used in query without sanitization
- More difficult to detect

---

## Prevention Techniques

### 1. Parameterized Queries (Prepared Statements)

**Standard Answer:**
Parameterized queries separate SQL code from data. The database treats parameters as data, not executable code, preventing injection.

**How It Works:**
1. SQL structure is defined separately
2. Parameters are passed as values
3. Database engine treats parameters as data only
4. Even if parameter contains SQL, it's not executed

**PostgreSQL Example:**
```javascript
// ✅ SAFE: Parameterized query
const email = req.body.email;
const query = 'SELECT * FROM users WHERE email = $1';
const result = await pool.query(query, [email]);

// Database treats $1 as data, not code
// Even if email = "admin' OR '1'='1"
// It's treated as literal string, not SQL
```

**MySQL Example:**
```javascript
// ✅ SAFE: Using placeholders
const email = req.body.email;
const query = 'SELECT * FROM users WHERE email = ?';
const [rows] = await connection.execute(query, [email]);
```

**Multiple Parameters:**
```javascript
// ✅ SAFE: Multiple parameters
const query = `
  SELECT * FROM users 
  WHERE email = $1 AND age > $2 AND status = $3
`;
const result = await pool.query(query, [email, minAge, status]);
```

### 2. ORM/ODM Usage

**Standard Answer:**
Object-Relational Mappers (ORMs) automatically use parameterized queries, preventing SQL injection.

**Sequelize Example:**
```javascript
// ✅ SAFE: ORM handles parameterization
const email = req.body.email;
const user = await User.findOne({
  where: { email: email } // Automatically parameterized
});

// ✅ SAFE: Even with raw conditions
const user = await User.findOne({
  where: {
    email: {
      [Op.eq]: email // Safe
    }
  }
});
```

**Mongoose Example:**
```javascript
// ✅ SAFE: ODM handles parameterization
const email = req.body.email;
const user = await User.findOne({ email: email }); // Safe

// ✅ SAFE: Even with operators
const users = await User.find({
  age: { $gt: minAge } // Safe
});
```

### 3. Input Validation and Sanitization

**Standard Answer:**
Validate and sanitize all user input before using it in queries. Whitelist allowed values when possible.

**Validation Example:**
```javascript
const { body, validationResult } = require('express-validator');

// ✅ Validate input
app.post('/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('age').isInt({ min: 0, max: 120 }),
    body('name').trim().isLength({ min: 2, max: 50 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Input is validated, now safe to use
    const user = await User.create(req.body);
    res.json(user);
  }
);
```

**Whitelist Example:**
```javascript
// ✅ Whitelist allowed values
const allowedStatuses = ['active', 'inactive', 'pending'];
const status = req.query.status;

if (!allowedStatuses.includes(status)) {
  return res.status(400).json({ error: 'Invalid status' });
}

// Safe to use - status is from whitelist
const users = await User.findAll({ where: { status } });
```

**Type Validation:**
```javascript
// ✅ Validate types
function validateUserId(id) {
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    throw new Error('Invalid user ID');
  }
  return numId;
}

const userId = validateUserId(req.params.id);
const user = await User.findByPk(userId);
```

### 4. Escaping (Last Resort)

**Standard Answer:**
Escaping special characters should be a last resort. Parameterized queries are preferred.

**When to Use:**
- Building dynamic table/column names (can't be parameterized)
- Legacy systems that don't support parameterized queries

**Example:**
```javascript
// ⚠️ Only for table/column names, not values
function escapeIdentifier(identifier) {
  // Remove any characters that aren't alphanumeric or underscore
  return identifier.replace(/[^a-zA-Z0-9_]/g, '');
}

const tableName = escapeIdentifier(req.params.table);
const query = `SELECT * FROM ${tableName}`; // Still risky, but safer
```

**PostgreSQL Identifier Quoting:**
```javascript
// ✅ Use pg-format for dynamic identifiers
const format = require('pg-format');
const tableName = 'users';
const query = format('SELECT * FROM %I', tableName);
```

### 5. Least Privilege Principle

**Standard Answer:**
Database users should have minimum required permissions. Don't use admin/root accounts for applications.

**Example:**
```sql
-- ✅ Create application user with limited permissions
CREATE USER app_user WITH PASSWORD 'secure_password';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE ON users TO app_user;
GRANT SELECT ON posts TO app_user;

-- Don't grant:
-- DROP, ALTER, CREATE (unless absolutely necessary)
-- Access to system tables
```

**Connection Configuration:**
```javascript
// ✅ Use limited privilege user
const pool = new Pool({
  user: 'app_user', // Not 'postgres' or 'root'
  password: 'secure_password',
  database: 'mydb',
  // Limited to specific database
});
```

### 6. Stored Procedures

**Standard Answer:**
Stored procedures can help prevent SQL injection by encapsulating SQL logic on the database server.

**Example:**
```sql
-- Create stored procedure
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE(id INTEGER, name VARCHAR, email VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT users.id, users.name, users.email
  FROM users
  WHERE users.email = user_email;
END;
$$ LANGUAGE plpgsql;
```

**Usage:**
```javascript
// ✅ Call stored procedure
const email = req.body.email;
const query = 'SELECT * FROM get_user_by_email($1)';
const result = await pool.query(query, [email]);
```

---

## Node.js Examples

### Express.js with pg (PostgreSQL)

**Vulnerable Implementation:**
```javascript
// ❌ VULNERABLE
app.get('/users', async (req, res) => {
  const email = req.query.email;
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  const result = await pool.query(query);
  res.json(result.rows);
});

// Attack: ?email=admin' OR '1'='1
// Returns all users
```

**Safe Implementation:**
```javascript
// ✅ SAFE: Parameterized query
app.get('/users', async (req, res) => {
  const email = req.query.email;
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  res.json(result.rows);
});

// Even if email = "admin' OR '1'='1"
// It's treated as literal string, returns nothing
```

### Express.js with Sequelize

**Vulnerable Implementation:**
```javascript
// ❌ VULNERABLE: Raw query with string interpolation
app.get('/users', async (req, res) => {
  const email = req.query.email;
  const users = await sequelize.query(
    `SELECT * FROM users WHERE email = '${email}'`
  );
  res.json(users);
});
```

**Safe Implementation:**
```javascript
// ✅ SAFE: Using Sequelize methods
app.get('/users', async (req, res) => {
  const email = req.query.email;
  const users = await User.findAll({
    where: { email: email } // Automatically parameterized
  });
  res.json(users);
});

// ✅ SAFE: Raw query with replacements
app.get('/users', async (req, res) => {
  const email = req.query.email;
  const users = await sequelize.query(
    'SELECT * FROM users WHERE email = :email',
    {
      replacements: { email: email }, // Parameterized
      type: QueryTypes.SELECT
    }
  );
  res.json(users);
});
```

### Dynamic Queries

**Vulnerable:**
```javascript
// ❌ VULNERABLE: Building query dynamically
function buildQuery(filters) {
  let query = 'SELECT * FROM users WHERE 1=1';
  const params = [];
  
  if (filters.email) {
    query += ` AND email = '${filters.email}'`; // Vulnerable!
  }
  if (filters.age) {
    query += ` AND age = ${filters.age}`; // Vulnerable!
  }
  
  return query;
}
```

**Safe:**
```javascript
// ✅ SAFE: Parameterized dynamic query
function buildQuery(filters) {
  let query = 'SELECT * FROM users WHERE 1=1';
  const params = [];
  let paramIndex = 1;
  
  if (filters.email) {
    query += ` AND email = $${paramIndex++}`;
    params.push(filters.email);
  }
  if (filters.age) {
    query += ` AND age = $${paramIndex++}`;
    params.push(filters.age);
  }
  
  return { query, params };
}

// Usage
const { query, params } = buildQuery(req.query);
const result = await pool.query(query, params);
```

### Order By and Limit (Special Cases)

**Vulnerable:**
```javascript
// ❌ VULNERABLE: Can't parameterize ORDER BY directly
const sortBy = req.query.sort; // Could be: "name; DROP TABLE users--"
const query = `SELECT * FROM users ORDER BY ${sortBy}`;
```

**Safe:**
```javascript
// ✅ SAFE: Whitelist allowed columns
const allowedColumns = ['name', 'email', 'created_at'];
const sortBy = req.query.sort || 'created_at';

if (!allowedColumns.includes(sortBy)) {
  return res.status(400).json({ error: 'Invalid sort column' });
}

// Escape identifier
const format = require('pg-format');
const query = format('SELECT * FROM users ORDER BY %I', sortBy);
const result = await pool.query(query);
```

---

## Best Practices

### 1. Always Use Parameterized Queries

```javascript
// ✅ DO: Always use parameters
const query = 'SELECT * FROM users WHERE email = $1';
await pool.query(query, [email]);

// ❌ DON'T: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### 2. Validate All Input

```javascript
// ✅ DO: Validate before using
const email = req.body.email;
if (!isValidEmail(email)) {
  return res.status(400).json({ error: 'Invalid email' });
}

// ❌ DON'T: Trust user input
const email = req.body.email; // Use directly
```

### 3. Use ORMs When Possible

```javascript
// ✅ DO: Use ORM
const user = await User.findOne({ where: { email } });

// ❌ DON'T: Raw queries unless necessary
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### 4. Principle of Least Privilege

```sql
-- ✅ DO: Limited permissions
GRANT SELECT, INSERT, UPDATE ON users TO app_user;

-- ❌ DON'T: Full access
GRANT ALL PRIVILEGES ON DATABASE mydb TO app_user;
```

### 5. Error Handling

```javascript
// ✅ DO: Don't expose database errors
try {
  const user = await User.findByPk(id);
} catch (error) {
  // Log error internally
  logger.error('Database error:', error);
  // Return generic error to user
  res.status(500).json({ error: 'Internal server error' });
}

// ❌ DON'T: Expose database structure
catch (error) {
  res.status(500).json({ error: error.message }); // Exposes table names, etc.
}
```

### 6. Regular Security Audits

- Review all database queries
- Use automated security scanning
- Keep dependencies updated
- Monitor for suspicious queries

---

## Real-World Examples

### Example 1: Login Bypass

**Vulnerable:**
```javascript
// ❌ VULNERABLE: Authentication bypass
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  const result = await pool.query(query);
  
  if (result.rows.length > 0) {
    // Login successful
  }
});

// Attack: email = "admin'--", password = anything
// Query becomes: SELECT * FROM users WHERE email = 'admin'--' AND password = 'anything'
// -- comments out the rest, bypassing password check
```

**Safe:**
```javascript
// ✅ SAFE: Parameterized query
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  
  if (result.rows.length > 0) {
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      // Login successful
    }
  }
});
```

### Example 2: Data Extraction

**Vulnerable:**
```javascript
// ❌ VULNERABLE: Union injection
app.get('/users/:id', async (req, res) => {
  const id = req.params.id;
  const query = `SELECT name, email FROM users WHERE id = ${id}`;
  const result = await pool.query(query);
  res.json(result.rows);
});

// Attack: id = "1 UNION SELECT password, credit_card FROM users"
// Exposes sensitive columns
```

**Safe:**
```javascript
// ✅ SAFE: Parameterized and validated
app.get('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  
  const query = 'SELECT name, email FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  res.json(result.rows);
});
```

### Example 3: Search Function

**Vulnerable:**
```javascript
// ❌ VULNERABLE: Search with injection
app.get('/search', async (req, res) => {
  const term = req.query.term;
  const query = `SELECT * FROM products WHERE name LIKE '%${term}%'`;
  const result = await pool.query(query);
  res.json(result.rows);
});
```

**Safe:**
```javascript
// ✅ SAFE: Parameterized LIKE query
app.get('/search', async (req, res) => {
  const term = req.query.term || '';
  const query = "SELECT * FROM products WHERE name LIKE $1";
  const searchTerm = `%${term}%`;
  const result = await pool.query(query, [searchTerm]);
  res.json(result.rows);
});
```

---

## Testing for SQL Injection

### Manual Testing

```javascript
// Test inputs to try:
const testInputs = [
  "' OR '1'='1",
  "'; DROP TABLE users--",
  "' UNION SELECT * FROM users--",
  "1' AND '1'='1",
  "1' AND '1'='2",
  "admin'--",
  "' OR 1=1--",
  "1; WAITFOR DELAY '00:00:05'--"
];

// If any of these cause unexpected behavior, you have a vulnerability
```

### Automated Testing

```javascript
// Use tools like:
// - sqlmap (automated SQL injection tool)
// - OWASP ZAP
// - Burp Suite
// - npm audit (for dependency vulnerabilities)
```

---

## Summary

**Key Takeaways:**
1. **Always use parameterized queries** - Never concatenate user input into SQL
2. **Validate all input** - Check type, format, and range
3. **Use ORMs** - They handle parameterization automatically
4. **Least privilege** - Database users should have minimal permissions
5. **Error handling** - Don't expose database structure in errors
6. **Regular audits** - Review code and dependencies regularly

**Remember:** If you're building SQL strings with user input, you're doing it wrong. Always use parameterized queries!

