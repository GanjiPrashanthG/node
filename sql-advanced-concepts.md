# SQL Advanced Concepts - Complete Guide

## Table of Contents
1. [Types of JOINs](#types-of-joins)
2. [GROUP BY and HAVING](#group-by-and-having)
3. [SQL Functions](#sql-functions)
4. [Window Functions](#window-functions)
5. [Types of Indexes](#types-of-indexes)
6. [Partitioning](#partitioning)
7. [Replication and Replicas](#replication-and-replicas)
8. [Vertical vs Horizontal Scaling](#vertical-vs-horizontal-scaling)
9. [Database Migrations](#database-migrations)

---

## Types of JOINs

### What are JOINs?

**Standard Answer:**
JOINs combine rows from two or more tables based on a related column between them. They allow you to query data from multiple tables in a single query.

**Simple Explanation:**
Think of JOINs like merging two spreadsheets based on a common column. Different types of JOINs determine which rows are included in the result.

### 1. INNER JOIN

**Standard Answer:**
INNER JOIN returns only rows that have matching values in both tables. If there's no match, the row is excluded from the result.

**Syntax:**
```sql
SELECT columns
FROM table1
INNER JOIN table2 ON table1.column = table2.column;
```

**Example:**
```sql
-- Users and their posts (only users with posts)
SELECT users.name, posts.title
FROM users
INNER JOIN posts ON users.id = posts.user_id;

-- Result: Only users who have at least one post
-- Users without posts are excluded
```

**Visual Representation:**
```
Table A:        Table B:        Result:
[1, 2, 3]  JOIN [2, 3, 4]  =   [2, 3]
```

**Real-World Use Case:**
```sql
-- Get orders with customer information (only orders with customers)
SELECT orders.id, customers.name, orders.total
FROM orders
INNER JOIN customers ON orders.customer_id = customers.id;
```

---

### 2. LEFT JOIN (LEFT OUTER JOIN)

**Standard Answer:**
LEFT JOIN returns all rows from the left table and matched rows from the right table. If no match, NULL values are returned for right table columns.

**Syntax:**
```sql
SELECT columns
FROM table1
LEFT JOIN table2 ON table1.column = table2.column;
```

**Example:**
```sql
-- All users and their posts (users without posts included)
SELECT users.name, posts.title
FROM users
LEFT JOIN posts ON users.id = posts.user_id;

-- Result: All users, posts.title is NULL for users without posts
```

**Visual Representation:**
```
Table A:        Table B:        Result:
[1, 2, 3]  JOIN [2, 3, 4]  =   [1-NULL, 2, 3]
```

**Real-World Use Case:**
```sql
-- Get all customers and their orders (including customers with no orders)
SELECT customers.name, orders.id, orders.total
FROM customers
LEFT JOIN orders ON customers.id = orders.customer_id
WHERE orders.id IS NULL; -- Customers who never placed an order
```

---

### 3. RIGHT JOIN (RIGHT OUTER JOIN)

**Standard Answer:**
RIGHT JOIN returns all rows from the right table and matched rows from the left table. If no match, NULL values are returned for left table columns.

**Syntax:**
```sql
SELECT columns
FROM table1
RIGHT JOIN table2 ON table1.column = table2.column;
```

**Example:**
```sql
-- All posts and their authors (posts without authors included)
SELECT users.name, posts.title
FROM users
RIGHT JOIN posts ON users.id = posts.user_id;

-- Result: All posts, users.name is NULL for posts without authors
```

**Visual Representation:**
```
Table A:        Table B:        Result:
[1, 2, 3]  JOIN [2, 3, 4]  =   [2, 3, NULL-4]
```

**Note:** RIGHT JOIN is less commonly used. LEFT JOIN is preferred for readability.

---

### 4. FULL OUTER JOIN

**Standard Answer:**
FULL OUTER JOIN returns all rows from both tables. If there's no match, NULL values are returned for missing columns.

**Syntax:**
```sql
SELECT columns
FROM table1
FULL OUTER JOIN table2 ON table1.column = table2.column;
```

**Example:**
```sql
-- All users and all posts
SELECT users.name, posts.title
FROM users
FULL OUTER JOIN posts ON users.id = posts.user_id;

-- Result: All users and all posts, NULLs where no match
```

**Visual Representation:**
```
Table A:        Table B:        Result:
[1, 2, 3]  JOIN [2, 3, 4]  =   [1-NULL, 2, 3, NULL-4]
```

**Real-World Use Case:**
```sql
-- Find all customers and all products (including unmatched)
SELECT customers.name, products.name
FROM customers
FULL OUTER JOIN orders ON customers.id = orders.customer_id
FULL OUTER JOIN order_items ON orders.id = order_items.order_id
FULL OUTER JOIN products ON order_items.product_id = products.id;
```

---

### 5. CROSS JOIN (Cartesian Product)

**Standard Answer:**
CROSS JOIN returns the Cartesian product of two tables - every row from the first table combined with every row from the second table.

**Syntax:**
```sql
SELECT columns
FROM table1
CROSS JOIN table2;
```

**Example:**
```sql
-- All combinations of users and products
SELECT users.name, products.name
FROM users
CROSS JOIN products;

-- If users has 3 rows and products has 4 rows
-- Result: 3 × 4 = 12 rows
```

**Use Case:**
- Generating test data
- Creating all possible combinations
- Matrix operations

**Warning:** Can produce very large result sets!

---

### 6. SELF JOIN

**Standard Answer:**
SELF JOIN is joining a table to itself. Useful for hierarchical data or comparing rows within the same table.

**Example:**
```sql
-- Employees and their managers (both in employees table)
SELECT 
  e.name AS employee,
  m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- Find employees with same manager
SELECT 
  e1.name AS employee1,
  e2.name AS employee2,
  m.name AS manager
FROM employees e1
INNER JOIN employees e2 ON e1.manager_id = e2.manager_id
INNER JOIN employees m ON e1.manager_id = m.id
WHERE e1.id < e2.id; -- Avoid duplicates
```

---

### 7. Multiple JOINs

**Example:**
```sql
-- Join multiple tables
SELECT 
  users.name,
  posts.title,
  comments.content
FROM users
INNER JOIN posts ON users.id = posts.user_id
LEFT JOIN comments ON posts.id = comments.post_id
ORDER BY users.name, posts.title;
```

---

## GROUP BY and HAVING

### GROUP BY

**Standard Answer:**
GROUP BY groups rows that have the same values in specified columns into summary rows. It's used with aggregate functions (COUNT, SUM, AVG, etc.).

**Syntax:**
```sql
SELECT column1, aggregate_function(column2)
FROM table
WHERE condition
GROUP BY column1;
```

**Basic Example:**
```sql
-- Count users by status
SELECT status, COUNT(*) as count
FROM users
GROUP BY status;

-- Result:
-- status    | count
-- ----------|------
-- active    | 150
-- inactive  | 30
-- suspended | 5
```

**Multiple Columns:**
```sql
-- Group by multiple columns
SELECT 
  status,
  age_group,
  COUNT(*) as count
FROM users
GROUP BY status, age_group;
```

**Real-World Examples:**

**Example 1: Sales by Product**
```sql
SELECT 
  products.name,
  SUM(order_items.quantity * order_items.price) as total_revenue,
  COUNT(DISTINCT orders.id) as order_count
FROM products
INNER JOIN order_items ON products.id = order_items.product_id
INNER JOIN orders ON order_items.order_id = orders.id
GROUP BY products.id, products.name
ORDER BY total_revenue DESC;
```

**Example 2: Monthly Statistics**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as user_count,
  AVG(age) as avg_age
FROM users
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;
```

**Example 3: Top Customers**
```sql
SELECT 
  customers.name,
  COUNT(orders.id) as order_count,
  SUM(orders.total) as total_spent
FROM customers
LEFT JOIN orders ON customers.id = orders.customer_id
GROUP BY customers.id, customers.name
HAVING COUNT(orders.id) > 5
ORDER BY total_spent DESC;
```

---

### HAVING Clause

**Standard Answer:**
HAVING filters groups after GROUP BY, similar to WHERE but for aggregated data. WHERE filters rows before grouping, HAVING filters groups after grouping.

**Key Difference:**
- **WHERE**: Filters rows before aggregation
- **HAVING**: Filters groups after aggregation

**Syntax:**
```sql
SELECT column1, aggregate_function(column2)
FROM table
WHERE condition
GROUP BY column1
HAVING aggregate_function(column2) condition;
```

**Example:**
```sql
-- Find departments with more than 5 employees
SELECT 
  department,
  COUNT(*) as employee_count
FROM employees
GROUP BY department
HAVING COUNT(*) > 5;

-- Find products with average rating > 4.0
SELECT 
  product_id,
  AVG(rating) as avg_rating,
  COUNT(*) as review_count
FROM reviews
GROUP BY product_id
HAVING AVG(rating) > 4.0 AND COUNT(*) >= 10;
```

**WHERE vs HAVING:**
```sql
-- WHERE filters before grouping
SELECT 
  department,
  COUNT(*) as count
FROM employees
WHERE salary > 50000  -- Filter employees first
GROUP BY department;

-- HAVING filters after grouping
SELECT 
  department,
  COUNT(*) as count
FROM employees
GROUP BY department
HAVING COUNT(*) > 10;  -- Filter groups after counting
```

**Combined Example:**
```sql
-- Employees earning > 50000, grouped by department,
-- showing only departments with > 5 such employees
SELECT 
  department,
  COUNT(*) as count,
  AVG(salary) as avg_salary
FROM employees
WHERE salary > 50000  -- Filter rows first
GROUP BY department
HAVING COUNT(*) > 5   -- Filter groups after
ORDER BY avg_salary DESC;
```

**Real-World Use Cases:**

**Example 1: Active Users by Month**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_users
FROM users
WHERE status = 'active'
GROUP BY DATE_TRUNC('month', created_at)
HAVING COUNT(*) > 100  -- Only months with > 100 new users
ORDER BY month;
```

**Example 2: High-Value Customers**
```sql
SELECT 
  customers.id,
  customers.name,
  SUM(orders.total) as total_spent,
  COUNT(orders.id) as order_count
FROM customers
INNER JOIN orders ON customers.id = orders.customer_id
WHERE orders.status = 'completed'
GROUP BY customers.id, customers.name
HAVING SUM(orders.total) > 1000 AND COUNT(orders.id) > 5
ORDER BY total_spent DESC;
```

---

## SQL Functions

### Aggregate Functions

**Standard Answer:**
Aggregate functions perform calculations on a set of rows and return a single value.

**Common Aggregate Functions:**

```sql
-- COUNT: Count rows
SELECT COUNT(*) FROM users;
SELECT COUNT(DISTINCT email) FROM users; -- Count unique emails

-- SUM: Sum of values
SELECT SUM(amount) FROM transactions;
SELECT SUM(quantity * price) FROM order_items;

-- AVG: Average value
SELECT AVG(age) FROM users;
SELECT AVG(price) FROM products;

-- MIN/MAX: Minimum/Maximum value
SELECT MIN(price) FROM products;
SELECT MAX(created_at) FROM orders;

-- STRING_AGG: Concatenate strings (PostgreSQL)
SELECT 
  department,
  STRING_AGG(name, ', ') as employees
FROM employees
GROUP BY department;
```

**Example:**
```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT country) as countries,
  AVG(age) as avg_age,
  MIN(age) as min_age,
  MAX(age) as max_age,
  SUM(balance) as total_balance
FROM users
WHERE status = 'active';
```

---

### String Functions

```sql
-- CONCAT: Concatenate strings
SELECT CONCAT(first_name, ' ', last_name) as full_name FROM users;

-- UPPER/LOWER: Case conversion
SELECT UPPER(name) FROM users;
SELECT LOWER(email) FROM users;

-- LENGTH: String length
SELECT LENGTH(name) as name_length FROM users;

-- SUBSTRING: Extract substring
SELECT SUBSTRING(email, 1, 5) FROM users;
SELECT SUBSTRING(email FROM 1 FOR 5) FROM users; -- PostgreSQL

-- TRIM: Remove whitespace
SELECT TRIM(name) FROM users;
SELECT LTRIM(name) FROM users; -- Left trim
SELECT RTRIM(name) FROM users; -- Right trim

-- REPLACE: Replace substring
SELECT REPLACE(email, '@', '[at]') FROM users;

-- POSITION: Find position of substring
SELECT POSITION('@' IN email) FROM users;
```

---

### Date Functions

```sql
-- CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP
SELECT CURRENT_DATE;
SELECT CURRENT_TIME;
SELECT CURRENT_TIMESTAMP;

-- EXTRACT: Extract date parts
SELECT EXTRACT(YEAR FROM created_at) as year FROM users;
SELECT EXTRACT(MONTH FROM created_at) as month FROM users;
SELECT EXTRACT(DAY FROM created_at) as day FROM users;

-- DATE_TRUNC: Truncate to specified precision (PostgreSQL)
SELECT DATE_TRUNC('month', created_at) as month FROM users;
SELECT DATE_TRUNC('year', created_at) as year FROM users;

-- AGE: Calculate age (PostgreSQL)
SELECT AGE(birth_date) FROM users;
SELECT AGE('2024-01-01', '2020-01-01'); -- 4 years

-- DATE_ADD/DATE_SUB: Add/subtract intervals
SELECT created_at + INTERVAL '1 day' FROM users;
SELECT created_at - INTERVAL '1 month' FROM users;

-- TO_CHAR: Format date (PostgreSQL)
SELECT TO_CHAR(created_at, 'YYYY-MM-DD') FROM users;
SELECT TO_CHAR(created_at, 'Month DD, YYYY') FROM users;
```

---

### Numeric Functions

```sql
-- ROUND: Round to decimal places
SELECT ROUND(price, 2) FROM products;

-- CEIL/FLOOR: Round up/down
SELECT CEIL(4.1); -- 5
SELECT FLOOR(4.9); -- 4

-- ABS: Absolute value
SELECT ABS(-10); -- 10

-- POWER: Exponentiation
SELECT POWER(2, 3); -- 8

-- SQRT: Square root
SELECT SQRT(16); -- 4

-- MOD: Modulo
SELECT MOD(10, 3); -- 1
```

---

## Window Functions

### What are Window Functions?

**Standard Answer:**
Window functions perform calculations across a set of table rows related to the current row. Unlike aggregate functions, window functions don't collapse rows into groups - they return a value for each row.

**Key Difference:**
- **Aggregate Functions**: Collapse rows (GROUP BY)
- **Window Functions**: Keep all rows, add calculated columns

**Syntax:**
```sql
SELECT 
  column1,
  window_function() OVER (PARTITION BY column ORDER BY column)
FROM table;
```

### Common Window Functions

**1. ROW_NUMBER()**
```sql
-- Assign sequential numbers to rows
SELECT 
  name,
  salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) as rank
FROM employees;

-- Rank within departments
SELECT 
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank
FROM employees;
```

**2. RANK() and DENSE_RANK()**
```sql
-- RANK: Leaves gaps for ties
SELECT 
  name,
  salary,
  RANK() OVER (ORDER BY salary DESC) as rank
FROM employees;
-- If two people have same salary, both get rank 1, next gets rank 3

-- DENSE_RANK(): No gaps
SELECT 
  name,
  salary,
  DENSE_RANK() OVER (ORDER BY salary DESC) as rank
FROM employees;
-- If two people have same salary, both get rank 1, next gets rank 2
```

**3. LAG() and LEAD()**
```sql
-- LAG: Access previous row
SELECT 
  date,
  sales,
  LAG(sales) OVER (ORDER BY date) as previous_sales,
  sales - LAG(sales) OVER (ORDER BY date) as change
FROM daily_sales;

-- LEAD: Access next row
SELECT 
  date,
  sales,
  LEAD(sales) OVER (ORDER BY date) as next_sales
FROM daily_sales;
```

**4. SUM(), AVG(), COUNT() as Window Functions**
```sql
-- Running total
SELECT 
  date,
  amount,
  SUM(amount) OVER (ORDER BY date) as running_total
FROM transactions;

-- Moving average (last 7 days)
SELECT 
  date,
  sales,
  AVG(sales) OVER (
    ORDER BY date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as moving_avg_7days
FROM daily_sales;

-- Percentage of total
SELECT 
  product,
  sales,
  sales * 100.0 / SUM(sales) OVER () as percent_of_total
FROM product_sales;
```

**5. FIRST_VALUE() and LAST_VALUE()**
```sql
-- First value in partition
SELECT 
  department,
  name,
  salary,
  FIRST_VALUE(salary) OVER (
    PARTITION BY department 
    ORDER BY salary DESC
  ) as top_salary_in_dept
FROM employees;

-- Last value
SELECT 
  department,
  name,
  salary,
  LAST_VALUE(salary) OVER (
    PARTITION BY department 
    ORDER BY salary DESC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) as lowest_salary_in_dept
FROM employees;
```

**Real-World Examples:**

**Example 1: Top N per Group**
```sql
-- Top 3 employees per department
SELECT * FROM (
  SELECT 
    name,
    department,
    salary,
    ROW_NUMBER() OVER (
      PARTITION BY department 
      ORDER BY salary DESC
    ) as rank
  FROM employees
) ranked
WHERE rank <= 3;
```

**Example 2: Month-over-Month Growth**
```sql
SELECT 
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month) as previous_month,
  revenue - LAG(revenue) OVER (ORDER BY month) as growth,
  (revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0 / 
    LAG(revenue) OVER (ORDER BY month) as growth_percent
FROM monthly_revenue;
```

---

## Types of Indexes

### What are Indexes?

**Standard Answer:**
Indexes are database structures that improve query performance by allowing faster data retrieval. They're like a book's index - instead of scanning every page, you can jump directly to the relevant page.

### 1. B-Tree Index (Default)

**Standard Answer:**
B-Tree (Balanced Tree) is the default index type in PostgreSQL. It's efficient for equality and range queries.

**Use Cases:**
- Equality queries (`WHERE id = 5`)
- Range queries (`WHERE age BETWEEN 18 AND 65`)
- Sorting (`ORDER BY created_at`)

**Example:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_age ON users(age);
CREATE INDEX idx_users_created ON users(created_at);
```

**When to Use:**
- Most common queries
- Columns used in WHERE, JOIN, ORDER BY
- High cardinality columns (many unique values)

---

### 2. Hash Index

**Standard Answer:**
Hash indexes are optimized for equality comparisons only. They're faster than B-Tree for exact matches but don't support range queries or sorting.

**Use Cases:**
- Exact equality matches only
- High-frequency equality lookups

**Example:**
```sql
CREATE INDEX idx_users_email_hash ON users USING HASH (email);
```

**Limitations:**
- Only supports `=` operator
- No range queries
- No sorting
- Not used in JOINs

---

### 3. GIN (Generalized Inverted Index)

**Standard Answer:**
GIN indexes are used for array and full-text search operations. They're efficient for queries that check if a value exists in an array or for text search.

**Use Cases:**
- Array columns (`WHERE tags @> ARRAY['nodejs']`)
- Full-text search
- JSONB columns

**Example:**
```sql
-- Array column
CREATE INDEX idx_users_tags_gin ON users USING GIN (tags);

-- Full-text search
CREATE INDEX idx_posts_content_gin ON posts 
USING GIN (to_tsvector('english', content));

-- JSONB
CREATE INDEX idx_users_metadata_gin ON users USING GIN (metadata);
```

**Query Examples:**
```sql
-- Array contains
SELECT * FROM users WHERE tags @> ARRAY['developer'];

-- Full-text search
SELECT * FROM posts 
WHERE to_tsvector('english', content) @@ to_tsquery('nodejs & javascript');
```

---

### 4. GiST (Generalized Search Tree)

**Standard Answer:**
GiST indexes support various data types and operations, including geometric data, full-text search, and range types.

**Use Cases:**
- Geometric data (PostGIS)
- Range types
- Full-text search (alternative to GIN)

**Example:**
```sql
-- Range type
CREATE INDEX idx_events_period_gist ON events USING GIST (period);

-- Geometric data
CREATE INDEX idx_locations_geom_gist ON locations USING GIST (geom);
```

---

### 5. BRIN (Block Range Index)

**Standard Answer:**
BRIN indexes store summary information about ranges of table blocks. They're very small but less precise than B-Tree indexes.

**Use Cases:**
- Very large tables
- Columns with natural ordering (timestamps, auto-increment IDs)
- When index size is a concern

**Example:**
```sql
CREATE INDEX idx_logs_created_brin ON logs USING BRIN (created_at);
```

**When to Use:**
- Tables with millions/billions of rows
- Time-series data
- When B-Tree index would be too large

---

### 6. Partial Index

**Standard Answer:**
Partial indexes index only a subset of rows based on a WHERE condition. They're smaller and faster for queries matching the condition.

**Example:**
```sql
-- Index only active users
CREATE INDEX idx_users_active_email ON users(email) 
WHERE status = 'active';

-- Index only recent orders
CREATE INDEX idx_orders_recent ON orders(created_at) 
WHERE created_at > '2024-01-01';
```

**Benefits:**
- Smaller index size
- Faster queries matching condition
- Less maintenance overhead

---

### 7. Composite Index

**Standard Answer:**
Composite indexes include multiple columns. The order of columns matters - they're most efficient when queries use the leftmost columns.

**Example:**
```sql
-- Composite index
CREATE INDEX idx_users_status_created ON users(status, created_at);

-- Efficient queries
SELECT * FROM users WHERE status = 'active' ORDER BY created_at;
SELECT * FROM users WHERE status = 'active' AND created_at > '2024-01-01';

-- Less efficient (can't use index for created_at alone)
SELECT * FROM users ORDER BY created_at; -- Index not used optimally
```

**Column Order Matters:**
```sql
-- Good: status first (used in WHERE)
CREATE INDEX idx_users_status_created ON users(status, created_at);

-- Less optimal: created_at first
CREATE INDEX idx_users_created_status ON users(created_at, status);
```

---

### 8. Unique Index

**Standard Answer:**
Unique indexes enforce uniqueness constraint on one or more columns.

**Example:**
```sql
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
-- Equivalent to: ALTER TABLE users ADD CONSTRAINT UNIQUE (email);
```

---

### Index Best Practices

**Do:**
- Index foreign keys
- Index columns in WHERE clauses
- Index columns in JOIN conditions
- Index columns in ORDER BY
- Use composite indexes for multi-column queries

**Don't:**
- Over-index (too many indexes slow down writes)
- Index low-cardinality columns (few unique values)
- Index columns rarely used in queries
- Create indexes on small tables

**Example:**
```sql
-- Good indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id); -- Foreign key
CREATE INDEX idx_orders_status_created ON orders(status, created_at); -- Common query
CREATE INDEX idx_users_email ON users(email); -- Unique lookup

-- Bad: Don't index boolean columns with few values
-- CREATE INDEX idx_users_is_active ON users(is_active); -- Usually not helpful
```

---

## Partitioning

### What is Partitioning?

**Standard Answer:**
Partitioning divides a large table into smaller, more manageable pieces called partitions. Each partition can be stored separately, improving query performance and maintenance.

**Benefits:**
- Faster queries (scan smaller partitions)
- Easier maintenance (drop old partitions)
- Better performance for large tables
- Can store partitions on different disks

### Types of Partitioning

**1. Range Partitioning**

**Standard Answer:**
Partitions are based on ranges of values (dates, numbers).

**Example:**
```sql
-- Partition by date range
CREATE TABLE orders (
  id SERIAL,
  customer_id INTEGER,
  order_date DATE,
  total DECIMAL
) PARTITION BY RANGE (order_date);

-- Create partitions
CREATE TABLE orders_2024_q1 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE orders_2024_q2 PARTITION OF orders
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

CREATE TABLE orders_2024_q3 PARTITION OF orders
  FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');

CREATE TABLE orders_2024_q4 PARTITION OF orders
  FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
```

**Query:**
```sql
-- Automatically queries only relevant partition
SELECT * FROM orders WHERE order_date = '2024-05-15';
-- Only scans orders_2024_q2 partition
```

**2. List Partitioning**

**Standard Answer:**
Partitions are based on specific values in a column.

**Example:**
```sql
CREATE TABLE users (
  id SERIAL,
  name VARCHAR,
  country VARCHAR
) PARTITION BY LIST (country);

CREATE TABLE users_us PARTITION OF users
  FOR VALUES IN ('US', 'USA');

CREATE TABLE users_india PARTITION OF users
  FOR VALUES IN ('IN', 'IND', 'India');

CREATE TABLE users_uk PARTITION OF users
  FOR VALUES IN ('UK', 'GB', 'United Kingdom');
```

**3. Hash Partitioning**

**Standard Answer:**
Partitions are based on hash function of a column, distributing data evenly.

**Example:**
```sql
CREATE TABLE products (
  id SERIAL,
  name VARCHAR,
  category_id INTEGER
) PARTITION BY HASH (category_id);

-- Create 4 hash partitions
CREATE TABLE products_0 PARTITION OF products
  FOR VALUES WITH (MODULUS 4, REMAINDER 0);

CREATE TABLE products_1 PARTITION OF products
  FOR VALUES WITH (MODULUS 4, REMAINDER 1);

CREATE TABLE products_2 PARTITION OF products
  FOR VALUES WITH (MODULUS 4, REMAINDER 2);

CREATE TABLE products_3 PARTITION OF products
  FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

### Partition Management

**Adding Partitions:**
```sql
-- Add new partition for next quarter
CREATE TABLE orders_2025_q1 PARTITION OF orders
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
```

**Dropping Partitions:**
```sql
-- Drop old partition (fast!)
DROP TABLE orders_2023_q1; -- Much faster than DELETE
```

**Best Practices:**
- Partition by date for time-series data
- Keep partition size manageable (millions of rows)
- Use partition pruning in queries
- Automate partition creation/dropping

---

## Replication and Replicas

### What is Replication?

**Standard Answer:**
Replication is creating and maintaining copies of a database on multiple servers. Replicas are read-only copies used for scaling reads and providing high availability.

**Types of Replication:**

**1. Master-Slave (Primary-Replica) Replication**

**Standard Answer:**
One master database handles writes, replicas handle reads. Changes are replicated from master to replicas.

**Architecture:**
```
Master (Primary)
  ├── Write operations
  ├── Replicates changes
  └── Handles all writes

Replica 1 (Read-only)
  ├── Read operations
  └── Receives updates from master

Replica 2 (Read-only)
  ├── Read operations
  └── Receives updates from master
```

**Benefits:**
- Scale read operations
- High availability (if master fails, promote replica)
- Geographic distribution
- Backup without impacting master

**Use Cases:**
- Read-heavy applications
- Reporting and analytics
- Geographic distribution

**2. Master-Master Replication**

**Standard Answer:**
Multiple masters can handle both reads and writes. Changes are replicated bidirectionally.

**Use Cases:**
- Multi-region applications
- Write scaling (with conflict resolution)

**Challenges:**
- Conflict resolution
- More complex setup
- Potential data inconsistency

### Setting Up Replication (PostgreSQL)

**Streaming Replication:**
```sql
-- On Master: postgresql.conf
wal_level = replica
max_wal_senders = 3
max_replication_slots = 3

-- On Master: pg_hba.conf
host replication replica_user 192.168.1.100/32 md5

-- On Replica: Create base backup and start replication
pg_basebackup -h master_host -D /var/lib/postgresql/data -U replica_user -P -W
```

**Application-Level:**
```javascript
// Read from replica, write to master
const masterPool = new Pool({
  host: 'master-db.example.com',
  // Write operations
});

const replicaPool = new Pool({
  host: 'replica-db.example.com',
  // Read operations
});

// Write to master
async function createUser(userData) {
  return await masterPool.query(
    'INSERT INTO users ...',
    [userData]
  );
}

// Read from replica
async function getUsers() {
  return await replicaPool.query('SELECT * FROM users');
}
```

---

## Vertical vs Horizontal Scaling

### Vertical Scaling (Scale Up)

**Standard Answer:**
Vertical scaling means increasing the capacity of a single server (more CPU, RAM, storage).

**Example:**
- Start: 4 CPU cores, 16GB RAM
- Scale: 16 CPU cores, 64GB RAM

**Pros:**
- Simple (no code changes)
- No data distribution needed
- Consistent performance

**Cons:**
- Limited by hardware maximums
- Expensive at high levels
- Single point of failure
- Downtime for upgrades

**When to Use:**
- Small to medium applications
- When hardware upgrade is simpler than code changes
- Applications that can't be easily distributed

---

### Horizontal Scaling (Scale Out)

**Standard Answer:**
Horizontal scaling means adding more servers to handle increased load.

**Example:**
- Start: 1 server
- Scale: 10 servers behind load balancer

**Pros:**
- Virtually unlimited scaling
- Cost-effective (commodity hardware)
- High availability (no single point of failure)
- Can scale specific components

**Cons:**
- More complex architecture
- Data distribution challenges
- Network latency between servers
- Requires stateless applications

**When to Use:**
- Large-scale applications
- Need for high availability
- Cost-effective scaling
- Cloud environments

### Scaling Strategies

**Application Scaling:**
```javascript
// Stateless application (easy to scale)
const app = express();
// No shared state, can run multiple instances

// Load balancer distributes requests
// Instance 1, Instance 2, Instance 3...
```

**Database Scaling:**
- **Read Replicas**: Scale reads horizontally
- **Sharding**: Distribute data across multiple databases
- **Caching**: Reduce database load

**Example Architecture:**
```
Load Balancer
  ├── App Server 1
  ├── App Server 2
  └── App Server 3
        │
        ├── Master DB (writes)
        └── Replica DBs (reads)
              ├── Replica 1
              ├── Replica 2
              └── Replica 3
```

---

## Database Migrations

### What are Migrations?

**Standard Answer:**
Migrations are version-controlled scripts that manage database schema changes. They allow you to evolve your database schema over time in a controlled, reversible way.

**Benefits:**
- Version control for database schema
- Reproducible deployments
- Rollback capability
- Team collaboration

### Up Migrations

**Standard Answer:**
Up migrations apply schema changes (forward direction).

**Example with Sequelize:**
```javascript
// migrations/20240101000000-create-users.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
    
    // Add index
    await queryInterface.addIndex('users', ['email']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
```

**Example with Knex.js:**
```javascript
// migrations/20240101000000_create_users.js
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.timestamps(true, true);
    
    table.index('email');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
```

### Down Migrations

**Standard Answer:**
Down migrations reverse the changes made by up migrations (rollback).

**Example:**
```javascript
// migrations/20240102000000-add-age-to-users.js
exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.integer('age');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('age');
  });
};
```

### Migration Best Practices

**1. Idempotent Migrations**
```javascript
// ✅ Good: Can run multiple times safely
exports.up = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('users', 'age');
  if (!hasColumn) {
    await knex.schema.table('users', function(table) {
      table.integer('age');
    });
  }
};

// ❌ Bad: Will fail if run twice
exports.up = async function(knex) {
  await knex.schema.table('users', function(table) {
    table.integer('age'); // Fails if column exists
  });
};
```

**2. Zero-Downtime Migrations**
```javascript
// Step 1: Add nullable column
exports.up = async function(knex) {
  await knex.schema.table('users', function(table) {
    table.string('new_field').nullable();
  });
};

// Step 2: Populate data (separate migration)
exports.up = async function(knex) {
  await knex('users').update({ new_field: 'default_value' });
};

// Step 3: Make NOT NULL (after data populated)
exports.up = async function(knex) {
  await knex.schema.table('users', function(table) {
    table.string('new_field').notNullable().alter();
  });
};
```

**3. Data Migrations**
```javascript
// Migrate data
exports.up = async function(knex) {
  // Transform existing data
  await knex('users')
    .where('status', 'active')
    .update({ is_active: true });
    
  await knex('users')
    .where('status', 'inactive')
    .update({ is_active: false });
};

exports.down = async function(knex) {
  // Reverse transformation
  await knex('users')
    .where('is_active', true)
    .update({ status: 'active' });
    
  await knex('users')
    .where('is_active', false)
    .update({ status: 'inactive' });
};
```

### Running Migrations

**Sequelize:**
```bash
# Run pending migrations
npx sequelize-cli db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback all migrations
npx sequelize-cli db:migrate:undo:all
```

**Knex.js:**
```bash
# Run migrations
npx knex migrate:latest

# Rollback
npx knex migrate:rollback

# Rollback all
npx knex migrate:rollback --all
```

**Programmatic:**
```javascript
// Run migrations in code
const { migrate } = require('postgres-migrations');

async function runMigrations() {
  const client = await pool.connect();
  try {
    await migrate({ client }, './migrations');
  } finally {
    client.release();
  }
}
```

### Migration Strategies

**1. Additive Changes (Safe)**
- Adding columns (nullable)
- Adding tables
- Adding indexes
- Adding constraints (if data allows)

**2. Destructive Changes (Requires Care)**
- Dropping columns
- Dropping tables
- Changing column types
- Adding NOT NULL constraints

**3. Zero-Downtime Pattern**
```javascript
// Old column: email
// New column: email_address

// Step 1: Add new column
exports.up = async function(knex) {
  await knex.schema.table('users', function(table) {
    table.string('email_address');
  });
};

// Step 2: Copy data
exports.up = async function(knex) {
  await knex.raw(`
    UPDATE users 
    SET email_address = email
  `);
};

// Step 3: Switch application to use new column
// Step 4: Drop old column (after verification)
exports.up = async function(knex) {
  await knex.schema.table('users', function(table) {
    table.dropColumn('email');
  });
};
```

---

## Interview Questions

### Q1: Explain the difference between WHERE and HAVING

**Standard Answer:**
- **WHERE**: Filters rows before grouping (used with GROUP BY)
- **HAVING**: Filters groups after grouping (used with aggregate functions)
- WHERE can't use aggregate functions, HAVING can
- WHERE is more efficient (filters early)

### Q2: When would you use a window function vs GROUP BY?

**Standard Answer:**
- **GROUP BY**: When you want to collapse rows into summary rows
- **Window Functions**: When you want to keep all rows but add calculated columns
- Window functions are useful for rankings, running totals, and row comparisons

### Q3: Explain different types of indexes and when to use each

**Standard Answer:**
- **B-Tree**: Default, good for most queries (equality, range, sorting)
- **Hash**: Only equality, faster for exact matches
- **GIN**: Arrays, full-text search, JSONB
- **GiST**: Geometric data, ranges
- **BRIN**: Very large tables, time-series data
- **Partial**: Subset of rows based on condition
- **Composite**: Multiple columns, order matters

### Q4: What is the difference between vertical and horizontal scaling?

**Standard Answer:**
- **Vertical**: Increase server capacity (CPU, RAM) - simpler but limited
- **Horizontal**: Add more servers - complex but unlimited
- Vertical: Single point of failure, expensive at scale
- Horizontal: High availability, cost-effective, requires distributed architecture

---

This comprehensive guide covers all advanced SQL concepts with practical examples and interview-ready explanations!

