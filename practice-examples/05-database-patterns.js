/**
 * Database Patterns and Best Practices
 * MongoDB with Mongoose examples
 */

const mongoose = require('mongoose');

// ===== CONNECTION =====
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mydb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Connection pool size
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Connection error:', err);
  }
}

// ===== SCHEMA DEFINITION =====
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
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
userSchema.index({ email: 1 }); // Single field index
userSchema.index({ name: 'text', email: 'text' }); // Text search index
userSchema.index({ status: 1, createdAt: -1 }); // Compound index

// ===== VIRTUAL PROPERTIES =====
userSchema.virtual('fullInfo').get(function() {
  return `${this.name} (${this.email}) - ${this.status}`;
});

// ===== INSTANCE METHODS =====
userSchema.methods.isActive = function() {
  return this.status === 'active';
};

userSchema.methods.activate = async function() {
  this.status = 'active';
  return await this.save();
};

// ===== STATIC METHODS =====
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// ===== MIDDLEWARE (Hooks) =====
// Pre-save hook
userSchema.pre('save', async function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  if (this.isModified('password')) {
    // Hash password before saving
    // const bcrypt = require('bcrypt');
    // this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = Date.now();
  next();
});

// Post-save hook
userSchema.post('save', function(doc, next) {
  console.log(`User ${doc.email} saved`);
  next();
});

// Pre-remove hook
userSchema.pre('remove', async function(next) {
  // Clean up related data
  // await Post.deleteMany({ authorId: this._id });
  next();
});

// ===== QUERY MIDDLEWARE =====
userSchema.pre(/^find/, function(next) {
  // Add default filter to all find queries
  // this.find({ status: { $ne: 'deleted' } });
  next();
});

const User = mongoose.model('User', userSchema);

// ===== CRUD OPERATIONS =====

// Create
async function createUser(userData) {
  try {
    const user = await User.create(userData);
    return user;
  } catch (err) {
    if (err.code === 11000) {
      throw new Error('Email already exists');
    }
    throw err;
  }
}

// Read - with various queries
async function findUsers() {
  // Find all active users
  const activeUsers = await User.find({ status: 'active' });
  
  // Find with pagination
  const page = 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const paginatedUsers = await User.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  // Find with select (only specific fields)
  const users = await User.find().select('name email');
  
  // Find with lean (returns plain objects, faster)
  const leanUsers = await User.find().lean();
  
  // Find one
  const user = await User.findOne({ email: 'john@example.com' });
  
  // Find by ID
  const userById = await User.findById(userId);
  
  // Find with conditions
  const adults = await User.find({ age: { $gte: 18 } });
  
  // Text search
  const searchResults = await User.find({ $text: { $search: 'john' } });
  
  return { activeUsers, paginatedUsers, users, user };
}

// Update
async function updateUser(userId, updateData) {
  // findByIdAndUpdate (returns updated document)
  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true } // Return updated doc, run validators
  );
  
  // Update one
  await User.updateOne(
    { _id: userId },
    { $set: updateData }
  );
  
  // Update many
  await User.updateMany(
    { status: 'inactive' },
    { $set: { lastLogin: new Date() } }
  );
  
  // Find and update (atomic)
  const updated = await User.findOneAndUpdate(
    { email: 'john@example.com' },
    { $inc: { loginCount: 1 } },
    { new: true }
  );
  
  return user;
}

// Delete
async function deleteUser(userId) {
  // Soft delete (update status)
  await User.findByIdAndUpdate(userId, { status: 'deleted' });
  
  // Hard delete
  await User.findByIdAndDelete(userId);
  
  // Delete many
  await User.deleteMany({ status: 'inactive' });
}

// ===== AGGREGATION =====
async function aggregateUsers() {
  // Group by status
  const statusCount = await User.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgAge: { $avg: '$age' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // Complex aggregation
  const stats = await User.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        avgAge: { $avg: '$age' },
        minAge: { $min: '$age' },
        maxAge: { $max: '$age' }
      }
    }
  ]);
  
  return { statusCount, stats };
}

// ===== TRANSACTIONS =====
async function transferData(session) {
  try {
    await session.withTransaction(async () => {
      const user1 = await User.findByIdAndUpdate(
        userId1,
        { $inc: { balance: -100 } },
        { session }
      );
      
      const user2 = await User.findByIdAndUpdate(
        userId2,
        { $inc: { balance: 100 } },
        { session }
      );
    });
  } catch (err) {
    console.error('Transaction failed:', err);
  }
}

// ===== BULK OPERATIONS =====
async function bulkOperations() {
  // Insert many
  await User.insertMany([
    { name: 'User1', email: 'user1@example.com' },
    { name: 'User2', email: 'user2@example.com' }
  ]);
  
  // Bulk write
  await User.bulkWrite([
    {
      updateOne: {
        filter: { email: 'user1@example.com' },
        update: { $set: { status: 'active' } }
      }
    },
    {
      deleteOne: {
        filter: { email: 'user2@example.com' }
      }
    }
  ]);
}

// ===== POPULATE (Relationships) =====
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Post = mongoose.model('Post', postSchema);

async function getPostsWithAuthor() {
  // Populate single field
  const posts = await Post.find().populate('authorId');
  
  // Populate with select
  const postsWithName = await Post.find().populate('authorId', 'name email');
  
  // Populate nested
  // const posts = await Post.find().populate({
  //   path: 'authorId',
  //   populate: { path: 'profile' }
  // });
  
  return posts;
}

// ===== PERFORMANCE OPTIMIZATION =====

// 1. Use indexes
userSchema.index({ email: 1, status: 1 });

// 2. Select only needed fields
const users = await User.find().select('name email');

// 3. Use lean() for read-only operations
const users = await User.find().lean();

// 4. Limit results
const users = await User.find().limit(100);

// 5. Use projection in aggregation
const users = await User.aggregate([
  { $project: { name: 1, email: 1 } }
]);

// 6. Use cursor for large datasets
const cursor = User.find().cursor();
for (let user = await cursor.next(); user != null; user = await cursor.next()) {
  // Process user
}

module.exports = {
  User,
  connectDB,
  createUser,
  findUsers,
  updateUser,
  deleteUser,
  aggregateUsers
};

