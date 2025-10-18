import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shelter from '@/lib/models/Shelter';
import { logWithTimestamp, validateAddress, sanitizeString } from '@/lib/utils';

/**
 * @swagger
 * /api/admin/shelters:
 *   get:
 *     summary: Get shelters list (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new shelter (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (status) query.status = status;
    
    const shelters = await Shelter.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Shelter.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      shelters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    logWithTimestamp(`Shelters fetch error: ${error.message}`, 'error');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shelters' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const body = await req.json();
    
    const { name, capacity, address, contact, facilities } = body;
    
    if (!name || !capacity || !address || !contact) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
      return NextResponse.json(
        { success: false, error: addressValidation.message },
        { status: 400 }
      );
    }
    
    if (!contact.phone) {
      return NextResponse.json(
        { success: false, error: 'Contact phone is required' },
        { status: 400 }
      );
    }
    
    const shelterData = {
      name: sanitizeString(name, 200),
      capacity: parseInt(capacity),
      currentOccupancy: body.currentOccupancy || 0,
      address: {
        street: sanitizeString(address.street, 200),
        city: sanitizeString(address.city, 100),
        district: sanitizeString(address.district, 100),
        division: sanitizeString(address.division, 100),
        postalCode: sanitizeString(address.postalCode, 20),
        landmark: sanitizeString(address.landmark, 200)
      },
      contact: {
        phone: contact.phone.trim(),
        email: contact.email?.trim()
      },
      facilities: facilities || [],
      status: body.status || 'active'
    };
    
    const shelter = await Shelter.create(shelterData);
    
    logWithTimestamp(`New shelter created: ${name} (ID: ${shelter._id})`, 'info');
    
    return NextResponse.json(
      {
        success: true,
        shelter,
        message: 'Shelter created successfully'
      },
      { status: 201 }
    );
    
  } catch (error) {
    logWithTimestamp(`Shelter creation error: ${error.message}`, 'error');
    return NextResponse.json(
      { success: false, error: 'Failed to create shelter' },
      { status: 500 }
    );
  }
}
