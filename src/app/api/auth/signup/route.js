import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { validateEmail, validatePassword, validatePhone, validateNID, validateAddress, sanitizeString, logWithTimestamp } from '@/lib/utils';

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user account
 *     description: Creates a new user with pending status. Admin approval required before login.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, role, address, phone]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               profession:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, volunteer, emergency_volunteer]
 *               volunteerType:
 *                 type: string
 *                 enum: [permanent, emergency]
 *               sector:
 *                 type: string
 *                 description: Required for volunteers (e.g., medical, rescue, logistics)
 *               experience:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street: { type: string }
 *                   city: { type: string }
 *                   district: { type: string }
 *                   division: { type: string }
 *                   postalCode: { type: string }
 *                   nearestLandmark: { type: string }
 *               phone:
 *                 type: string
 *               nid:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 userId: { type: string }
 *                 status: { type: string, example: pending }
 *                 message: { type: string }
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
export async function POST(req) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    // Validate required fields
    const { email, password, name, role, address, phone } = body;
    
    if (!email || !password || !name || !role || !address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.message },
        { status: 400 }
      );
    }
    
    // Validate phone
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.message },
        { status: 400 }
      );
    }
    
    // Validate NID
    if (body.nid) {
      const nidValidation = validateNID(body.nid);
      if (!nidValidation.valid) {
        return NextResponse.json(
          { success: false, error: nidValidation.message },
          { status: 400 }
        );
      }
    }
    
    // Validate address
    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
      return NextResponse.json(
        { success: false, error: addressValidation.message },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = ['user', 'volunteer', 'emergency_volunteer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // For volunteers, sector is required
    if ((role === 'volunteer' || role === 'emergency_volunteer') && !body.sector) {
      return NextResponse.json(
        { success: false, error: 'Sector is required for volunteers' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Prepare user data
    const userData = {
      email: email.toLowerCase(),
      passwordHash,
      name: sanitizeString(name, 100),
      role,
      address: {
        street: sanitizeString(address.street, 200),
        city: sanitizeString(address.city, 100),
        district: sanitizeString(address.district, 100),
        division: sanitizeString(address.division, 100),
        postalCode: sanitizeString(address.postalCode, 20),
        nearestLandmark: sanitizeString(address.nearestLandmark, 200)
      },
      phone: phone?.trim(),
      status: 'pending' // All new accounts start as pending
    };
    
    // Add optional fields
    if (body.age) userData.age = parseInt(body.age);
    if (body.profession) userData.profession = sanitizeString(body.profession, 100);
    if (body.nid) userData.nid = body.nid.trim();
    
    // Add volunteer-specific fields
    if (role === 'volunteer' || role === 'emergency_volunteer') {
      userData.volunteerType = body.volunteerType || (role === 'emergency_volunteer' ? 'emergency' : 'permanent');
      userData.sector = sanitizeString(body.sector, 100);
      if (body.experience) userData.experience = sanitizeString(body.experience, 500);
    }
    
    // Create user
    const user = await User.create(userData);
    
    logWithTimestamp(`New ${role} registration: ${email} (ID: ${user._id})`, 'info');
    
    // In production, send email notification to admin here
    
    return NextResponse.json(
      {
        success: true,
        userId: user._id.toString(),
        status: 'pending',
        message: 'Registration successful. Your account is pending admin approval. You will be notified via email once approved.'
      },
      { status: 201 }
    );
    
  } catch (error) {
    logWithTimestamp(`Signup error: ${error.message}`, 'error');
    console.error('Signup error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
