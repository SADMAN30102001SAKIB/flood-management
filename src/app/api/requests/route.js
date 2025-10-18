import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Request from '@/lib/models/Request';
import User from '@/lib/models/User';
import { validateRequestData, sanitizeString, logWithTimestamp } from '@/lib/utils';

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new help request (authenticated users only)
 *     description: Submit a request for rescue, medical, food, clothes, shelter, or other help
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, description, address]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [rescue, medical, food, clothes, shelter, other]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: object
 *               location:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get requests list (role-aware filtering)
 *     description: Fetch requests with optional filters. Volunteers see filtered by area/sector
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Requests list with pagination
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const body = await req.json();
    
    // Validate request data
    const validation = validateRequestData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }
    
    // Prepare request data
    const requestData = {
      userId: session.user.id,
      type: body.type,
      title: sanitizeString(body.title, 200),
      description: sanitizeString(body.description, 2000),
      address: {
        street: sanitizeString(body.address.street, 200),
        city: sanitizeString(body.address.city, 100),
        district: sanitizeString(body.address.district, 100),
        division: sanitizeString(body.address.division, 100),
        postalCode: sanitizeString(body.address.postalCode, 20),
        landmark: sanitizeString(body.address.landmark, 200)
      },
      priority: body.priority || 'medium',
      status: 'pending'
    };
    
    // Add location if provided
    if (body.location && body.location.coordinates && body.location.coordinates.length === 2) {
      requestData.location = {
        type: 'Point',
        coordinates: body.location.coordinates // [longitude, latitude]
      };
    }
    
    // Create request
    const request = await Request.create(requestData);
    
    logWithTimestamp(`New ${body.type} request created by user ${session.user.email} (ID: ${request._id})`, 'info');
    
    // In production, send notification to volunteers in the area
    
    return NextResponse.json(
      {
        success: true,
        requestId: request._id.toString(),
        status: request.status,
        message: 'Request submitted successfully. Volunteers in your area will be notified.'
      },
      { status: 201 }
    );
    
  } catch (error) {
    logWithTimestamp(`Request creation error: ${error.message}`, 'error');
    console.error('Request creation error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create request. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const area = searchParams.get('area');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    
    // Build query based on user role
    const query = {};
    
    if (session.user.role === 'user') {
      // Users see only their own requests
      query.userId = session.user.id;
    } else if (session.user.role === 'volunteer' || session.user.role === 'emergency_volunteer') {
      // Volunteers see requests in their area/sector
      const volunteer = await User.findById(session.user.id);
      
      if (volunteer.sector) {
        // Filter by sector (map request type to sector)
        const sectorTypeMap = {
          'medical': ['medical'],
          'rescue': ['rescue'],
          'logistics': ['food', 'clothes', 'shelter'],
          'food': ['food'],
          'shelter': ['shelter']
        };
        
        const relevantTypes = sectorTypeMap[volunteer.sector.toLowerCase()] || [];
        if (relevantTypes.length > 0) {
          query.type = { $in: relevantTypes };
        }
      }
      
      if (area) {
        query['address.district'] = area;
      } else if (volunteer.address && volunteer.address.district) {
        query['address.district'] = volunteer.address.district;
      }
      
      // Emergency volunteers see only high priority and urgent
      if (session.user.role === 'emergency_volunteer') {
        query.priority = { $in: ['high', 'urgent'] };
      }
      
      // Volunteers don't see completed or rejected requests
      query.status = { $in: ['pending', 'assigned', 'in_progress'] };
    }
    // Admin sees all requests (no filter)
    
    // Apply additional filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    
    // Fetch requests
    const requests = await Request.find(query)
      .populate('userId', 'name email phone address')
      .populate('assignedVolunteerId', 'name email phone sector')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Request.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    logWithTimestamp(`Requests fetch error: ${error.message}`, 'error');
    console.error('Requests fetch error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
