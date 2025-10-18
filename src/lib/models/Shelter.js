import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  district: { type: String },
  division: { type: String },
  postalCode: { type: String },
  landmark: { type: String }
}, { _id: false });

const contactSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String }
}, { _id: false });

const shelterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shelter name is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [0, 'Capacity must be positive']
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: [0, 'Occupancy must be positive'],
    validate: {
      validator: function(v) {
        return v <= this.capacity;
      },
      message: 'Occupancy cannot exceed capacity'
    }
  },
  address: {
    type: addressSchema,
    required: [true, 'Address is required']
  },
  contact: {
    type: contactSchema,
    required: [true, 'Contact information is required']
  },
  facilities: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'full'],
    default: 'active'
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

// Virtual to check available capacity
shelterSchema.virtual('availableCapacity').get(function() {
  return this.capacity - this.currentOccupancy;
});

shelterSchema.virtual('isFull').get(function() {
  return this.currentOccupancy >= this.capacity;
});

shelterSchema.index({ status: 1 });
shelterSchema.index({ 'address.district': 1, 'address.division': 1 });

shelterSchema.set('toJSON', { virtuals: true });
shelterSchema.set('toObject', { virtuals: true });

export default mongoose.models.Shelter || mongoose.model('Shelter', shelterSchema);
