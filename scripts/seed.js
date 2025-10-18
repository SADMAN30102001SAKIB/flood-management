const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flood-relief';

// Define schemas (inline for seed script)
const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  district: String,
  division: String,
  postalCode: String,
  nearestLandmark: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  age: Number,
  profession: String,
  address: addressSchema,
  nid: String,
  role: { type: String, enum: ['user', 'volunteer', 'emergency_volunteer', 'admin'], default: 'user' },
  volunteerType: { type: String, enum: ['permanent', 'emergency', null], default: null },
  sector: String,
  experience: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  phone: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['rescue', 'medical', 'food', 'clothes', 'shelter', 'other'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: addressSchema,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['pending', 'assigned', 'in_progress', 'completed', 'rejected'], default: 'pending' },
  assignedVolunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const shelterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  address: addressSchema,
  contact: {
    phone: { type: String, required: true },
    email: String
  },
  facilities: [String],
  status: { type: String, enum: ['active', 'inactive', 'full'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['broadcast', 'request_assigned', 'request_updated', 'account_approved', 'account_rejected', 'general'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);
const Shelter = mongoose.models.Shelter || mongoose.model('Shelter', shelterSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

async function seed() {
  try {
    console.log('🌱 Starting seed process...');
    console.log('📡 Connecting to MongoDB:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Request.deleteMany({});
    await Shelter.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Data cleared');

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);
    const volunteerPassword = await bcrypt.hash('Volunteer@123', 10);

    // Create Admin
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      email: 'admin@floodrelief.com',
      passwordHash: hashedPassword,
      name: 'System Administrator',
      role: 'admin',
      status: 'approved',
      phone: '01712345678',
      address: {
        street: 'Admin Office',
        city: 'Dhaka',
        district: 'Dhaka',
        division: 'Dhaka',
        postalCode: '1000'
      }
    });
    console.log('✅ Admin created:', admin.email);

    // Create Users
    console.log('👥 Creating users...');
    const users = await User.insertMany([
      {
        email: 'user1@example.com',
        passwordHash: userPassword,
        name: 'Rahim Uddin',
        age: 35,
        profession: 'Teacher',
        role: 'user',
        status: 'approved',
        phone: '01812345678',
        nid: '1234567890',
        address: {
          street: 'Mirpur Road',
          city: 'Dhaka',
          district: 'Dhaka',
          division: 'Dhaka',
          postalCode: '1216',
          nearestLandmark: 'Mirpur 10 Circle'
        }
      },
      {
        email: 'user2@example.com',
        passwordHash: userPassword,
        name: 'Fatema Begum',
        age: 28,
        profession: 'Nurse',
        role: 'user',
        status: 'approved',
        phone: '01912345678',
        address: {
          street: 'Station Road',
          city: 'Chittagong',
          district: 'Chittagong',
          division: 'Chittagong',
          postalCode: '4000',
          nearestLandmark: 'Chittagong Medical College'
        }
      },
      {
        email: 'user3@example.com',
        passwordHash: userPassword,
        name: 'Kamal Hossain',
        age: 42,
        profession: 'Farmer',
        role: 'user',
        status: 'pending',
        phone: '01712345679',
        address: {
          street: 'Village: Rampur',
          city: 'Bogra',
          district: 'Bogra',
          division: 'Rajshahi',
          postalCode: '5800'
        }
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create Volunteers
    console.log('🤝 Creating volunteers...');
    const volunteers = await User.insertMany([
      {
        email: 'volunteer1@example.com',
        passwordHash: volunteerPassword,
        name: 'Dr. Ahmed Khan',
        role: 'volunteer',
        volunteerType: 'permanent',
        sector: 'medical',
        experience: '10 years experience in emergency medicine. MBBS from Dhaka Medical College.',
        status: 'approved',
        phone: '01712345680',
        address: {
          city: 'Dhaka',
          district: 'Dhaka',
          division: 'Dhaka'
        }
      },
      {
        email: 'volunteer2@example.com',
        passwordHash: volunteerPassword,
        name: 'Salman Rahman',
        role: 'volunteer',
        volunteerType: 'permanent',
        sector: 'rescue',
        experience: 'Former Navy officer. 5 years rescue operations experience.',
        status: 'approved',
        phone: '01812345680',
        address: {
          city: 'Chittagong',
          district: 'Chittagong',
          division: 'Chittagong'
        }
      },
      {
        email: 'volunteer3@example.com',
        passwordHash: volunteerPassword,
        name: 'Nusrat Jahan',
        role: 'volunteer',
        volunteerType: 'permanent',
        sector: 'logistics',
        experience: 'NGO worker with experience in food distribution and relief coordination.',
        status: 'approved',
        phone: '01912345680',
        address: {
          city: 'Sylhet',
          district: 'Sylhet',
          division: 'Sylhet'
        }
      },
      {
        email: 'emergency1@example.com',
        passwordHash: volunteerPassword,
        name: 'Imran Hossain',
        role: 'emergency_volunteer',
        volunteerType: 'emergency',
        sector: 'rescue',
        experience: 'Local community leader. Available for immediate response.',
        status: 'approved',
        phone: '01612345680',
        address: {
          city: 'Dhaka',
          district: 'Dhaka',
          division: 'Dhaka'
        }
      },
      {
        email: 'emergency2@example.com',
        passwordHash: volunteerPassword,
        name: 'Ayesha Siddique',
        role: 'emergency_volunteer',
        volunteerType: 'emergency',
        sector: 'medical',
        experience: 'Paramedic with 3 years experience.',
        status: 'approved',
        phone: '01512345680',
        address: {
          city: 'Khulna',
          district: 'Khulna',
          division: 'Khulna'
        }
      },
      {
        email: 'pending.volunteer@example.com',
        passwordHash: volunteerPassword,
        name: 'Pending Volunteer',
        role: 'volunteer',
        volunteerType: 'permanent',
        sector: 'food',
        experience: 'Want to help with food distribution.',
        status: 'pending',
        phone: '01412345680',
        address: {
          city: 'Rajshahi',
          district: 'Rajshahi',
          division: 'Rajshahi'
        }
      }
    ]);
    console.log(`✅ Created ${volunteers.length} volunteers`);

    // Create Requests
    console.log('📋 Creating requests...');
    const approvedVolunteer = volunteers.find(v => v.status === 'approved' && v.sector === 'rescue');
    const requests = await Request.insertMany([
      {
        userId: users[0]._id,
        type: 'rescue',
        title: 'Urgent: Family trapped on rooftop',
        description: 'Our family of 5 is trapped on the rooftop due to severe flooding. Water level is rising. Need immediate evacuation.',
        priority: 'urgent',
        status: 'pending',
        address: {
          street: 'Mirpur Road',
          city: 'Dhaka',
          district: 'Dhaka',
          division: 'Dhaka',
          landmark: 'Near Mirpur 10 Circle'
        }
      },
      {
        userId: users[0]._id,
        type: 'medical',
        title: 'Elderly mother needs medicine',
        description: 'My mother (70 years old) ran out of blood pressure medication. Need urgent supply.',
        priority: 'high',
        status: 'assigned',
        assignedVolunteerId: volunteers.find(v => v.sector === 'medical')._id,
        assignedAt: new Date(),
        address: {
          street: 'Mirpur Road',
          city: 'Dhaka',
          district: 'Dhaka',
          division: 'Dhaka'
        }
      },
      {
        userId: users[1]._id,
        type: 'food',
        title: 'Need food supplies for family',
        description: 'Family of 4 without food for 2 days. Need rice, lentils, and drinking water.',
        priority: 'high',
        status: 'pending',
        address: {
          city: 'Chittagong',
          district: 'Chittagong',
          division: 'Chittagong',
          landmark: 'Near Chittagong Medical College'
        }
      },
      {
        userId: users[1]._id,
        type: 'shelter',
        title: 'Shelter needed for displaced family',
        description: 'Our house is completely flooded. Need temporary shelter for family of 6.',
        priority: 'medium',
        status: 'in_progress',
        assignedVolunteerId: volunteers.find(v => v.sector === 'logistics')._id,
        assignedAt: new Date(Date.now() - 86400000),
        address: {
          city: 'Chittagong',
          district: 'Chittagong',
          division: 'Chittagong'
        }
      },
      {
        userId: users[0]._id,
        type: 'clothes',
        title: 'Clothes for children',
        description: 'Need clothes and blankets for 3 children (ages 5, 8, 12).',
        priority: 'medium',
        status: 'completed',
        assignedVolunteerId: volunteers[2]._id,
        assignedAt: new Date(Date.now() - 172800000),
        address: {
          city: 'Dhaka',
          district: 'Dhaka',
          division: 'Dhaka'
        }
      },
      {
        userId: users[1]._id,
        type: 'other',
        title: 'Clean drinking water needed',
        description: 'Community of 50 families needs clean drinking water. Current water source contaminated.',
        priority: 'urgent',
        status: 'pending',
        address: {
          city: 'Chittagong',
          district: 'Chittagong',
          division: 'Chittagong'
        }
      }
    ]);
    console.log(`✅ Created ${requests.length} requests`);

    // Create Shelters
    console.log('🏕️ Creating shelters...');
    const shelters = await Shelter.insertMany([
      {
        name: 'Mirpur Community Center Shelter',
        capacity: 500,
        currentOccupancy: 320,
        address: {
          street: 'Section 10',
          city: 'Dhaka',
          district: 'Dhaka',
          division: 'Dhaka',
          postalCode: '1216',
          landmark: 'Mirpur 10 Circle'
        },
        contact: {
          phone: '01712345681',
          email: 'mirpur.shelter@example.com'
        },
        facilities: ['Medical Aid', 'Food', 'Sanitation', 'Children\'s Area'],
        status: 'active'
      },
      {
        name: 'Chittagong City Corporation Shelter',
        capacity: 800,
        currentOccupancy: 650,
        address: {
          city: 'Chittagong',
          district: 'Chittagong',
          division: 'Chittagong',
          landmark: 'City Corporation Building'
        },
        contact: {
          phone: '01812345681'
        },
        facilities: ['Medical Aid', 'Food', 'Sanitation'],
        status: 'active'
      },
      {
        name: 'Sylhet Stadium Shelter',
        capacity: 1000,
        currentOccupancy: 450,
        address: {
          city: 'Sylhet',
          district: 'Sylhet',
          division: 'Sylhet'
        },
        contact: {
          phone: '01912345681'
        },
        facilities: ['Food', 'Sanitation', 'Security'],
        status: 'active'
      },
      {
        name: 'Khulna School Shelter',
        capacity: 300,
        currentOccupancy: 295,
        address: {
          city: 'Khulna',
          district: 'Khulna',
          division: 'Khulna'
        },
        contact: {
          phone: '01612345681'
        },
        facilities: ['Food', 'Sanitation'],
        status: 'active'
      },
      {
        name: 'Bogra Relief Camp',
        capacity: 400,
        currentOccupancy: 400,
        address: {
          city: 'Bogra',
          district: 'Bogra',
          division: 'Rajshahi'
        },
        contact: {
          phone: '01512345681'
        },
        facilities: ['Medical Aid', 'Food'],
        status: 'full'
      }
    ]);
    console.log(`✅ Created ${shelters.length} shelters`);

    // Create Sample Notifications
    console.log('🔔 Creating sample notifications...');
    const notifications = await Notification.insertMany([
      // Account approval notifications for approved users
      {
        recipientId: users[0]._id, // user1
        type: 'account_approved',
        title: '✅ Account Approved!',
        message: 'Welcome to Flood Relief Management! Your account has been approved. You can now access all features.',
        link: '/dashboard',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        recipientId: users[1]._id, // user2
        type: 'account_approved',
        title: '✅ Account Approved!',
        message: 'Welcome to Flood Relief Management! Your account has been approved. You can now access all features.',
        link: '/dashboard',
        isRead: true,
        readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      // Request assigned notifications
      {
        recipientId: users[0]._id, // user1
        type: 'request_assigned',
        title: '📋 Volunteer Assigned to Your Request',
        message: `Dr. Ahmed Khan has accepted your Medical assistance request. They will contact you soon.`,
        link: '/dashboard/user',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      // Request status update notifications
      {
        recipientId: users[1]._id, // user2
        type: 'request_updated',
        title: '🔄 Request Status Updated',
        message: 'Your Food supplies request status has been updated to: In Progress',
        link: '/dashboard/user',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      // Broadcast notifications
      {
        recipientId: users[0]._id,
        type: 'broadcast',
        title: '📢 Emergency Alert: Heavy Rainfall Expected',
        message: 'Weather forecast predicts heavy rainfall in the next 48 hours. Please take necessary precautions and stay safe.',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        recipientId: users[1]._id,
        type: 'broadcast',
        title: '📢 Emergency Alert: Heavy Rainfall Expected',
        message: 'Weather forecast predicts heavy rainfall in the next 48 hours. Please take necessary precautions and stay safe.',
        isRead: true,
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        recipientId: volunteers[0]._id,
        type: 'broadcast',
        title: '📢 Emergency Alert: Heavy Rainfall Expected',
        message: 'Weather forecast predicts heavy rainfall in the next 48 hours. Please take necessary precautions and stay safe.',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      // Volunteer notifications
      {
        recipientId: volunteers[0]._id, // volunteer1
        type: 'general',
        title: '📌 Thank You for Your Service',
        message: 'Your dedication to helping flood victims is appreciated. You have successfully completed 5 rescue operations this month.',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        recipientId: volunteers[0]._id,
        type: 'account_approved',
        title: '✅ Volunteer Account Approved!',
        message: 'Congratulations! Your volunteer account has been approved. You can now accept and manage rescue requests.',
        link: '/dashboard',
        isRead: true,
        readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      // Emergency volunteer notifications
      {
        recipientId: volunteers[3]._id, // emergency1
        type: 'broadcast',
        title: '🚨 Urgent: Multiple Rescue Requests in Sylhet',
        message: 'Emergency situation: Multiple high-priority rescue requests in Sylhet region. Immediate volunteer response needed.',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        recipientId: volunteers[4]._id, // emergency2
        type: 'broadcast',
        title: '🚨 Urgent: Multiple Rescue Requests in Sylhet',
        message: 'Emergency situation: Multiple high-priority rescue requests in Sylhet region. Immediate volunteer response needed.',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      // More varied notifications
      {
        recipientId: users[0]._id,
        type: 'general',
        title: '📌 New Shelter Available in Your Area',
        message: 'A new emergency shelter has been set up at Dhaka Medical College. Capacity: 500 people.',
        link: '/dashboard/user',
        isRead: true,
        readAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    ]);
    console.log(`✅ Created ${notifications.length} sample notifications`);

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Admin: 1 (admin@floodrelief.com / Admin@123)`);
    console.log(`   - Users: ${users.length} (user1@example.com, user2@example.com, etc. / User@123)`);
    console.log(`   - Volunteers: ${volunteers.length} (volunteer1@example.com, emergency1@example.com, etc. / Volunteer@123)`);
    console.log(`   - Requests: ${requests.length}`);
    console.log(`   - Shelters: ${shelters.length}`);
    console.log(`   - Notifications: ${notifications.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@floodrelief.com / Admin@123');
    console.log('   User: user1@example.com / User@123');
    console.log('   Volunteer: volunteer1@example.com / Volunteer@123');
    console.log('   Emergency: emergency1@example.com / Volunteer@123');
    console.log('');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seed
seed();
