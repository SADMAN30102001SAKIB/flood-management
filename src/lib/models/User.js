import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  district: { type: String },
  division: { type: String },
  postalCode: { type: String },
  nearestLandmark: { type: String }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  age: {
    type: Number,
    min: [0, 'Age must be positive'],
    max: [150, 'Age must be realistic']
  },
  profession: {
    type: String,
    trim: true
  },
  address: {
    type: addressSchema,
    required: [true, 'Address is required']
  },
  nid: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'volunteer', 'emergency_volunteer', 'admin'],
      message: '{VALUE} is not a valid role'
    },
    default: 'user'
  },
  volunteerType: {
    type: String,
    enum: {
      values: ['permanent', 'emergency', null],
      message: '{VALUE} is not a valid volunteer type'
    },
    default: null
  },
  sector: {
    type: String,
    trim: true
    // e.g., medical, rescue, logistics, food, shelter
  },
  experience: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  phone: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries (email index already created by unique: true)
userSchema.index({ role: 1, status: 1 });
userSchema.index({ status: 1 });

// Virtual to check if user is approved
userSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
