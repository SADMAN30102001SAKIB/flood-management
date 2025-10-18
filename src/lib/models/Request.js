import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  district: { type: String },
  division: { type: String },
  postalCode: { type: String },
  landmark: { type: String }
}, { _id: false });

const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  mimeType: { type: String },
  filename: { type: String }
}, { _id: false });

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: {
      values: ['rescue', 'medical', 'food', 'clothes', 'shelter', 'other'],
      message: '{VALUE} is not a valid request type'
    },
    required: [true, 'Request type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description must be less than 2000 characters']
  },
  address: {
    type: addressSchema,
    required: [true, 'Address is required']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function(v) {
          return v.length === 0 || (v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90);
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'medium'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'assigned', 'in_progress', 'completed', 'rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  assignedVolunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date
  },
  attachments: {
    type: [attachmentSchema],
    default: []
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

// Index for geospatial queries
requestSchema.index({ location: '2dsphere' });
requestSchema.index({ userId: 1, createdAt: -1 });
requestSchema.index({ status: 1, priority: -1 });
requestSchema.index({ assignedVolunteerId: 1 });
requestSchema.index({ 'address.district': 1, 'address.division': 1 });

export default mongoose.models.Request || mongoose.model('Request', requestSchema);
