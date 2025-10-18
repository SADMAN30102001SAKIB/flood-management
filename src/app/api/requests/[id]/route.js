import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Request from '@/lib/models/Request';
import { logWithTimestamp } from '@/lib/utils';

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get request details (role-aware)
 *     description: Fetch a single request by ID
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request details
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Request not found
 */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { id } = params;
    
    const request = await Request.findById(id)
      .populate('userId', 'name email phone address')
      .populate('assignedVolunteerId', 'name email phone sector')
      .lean();
    
    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }
    
    // Role-based access control
    if (session.user.role === 'user') {
      // Users can only see their own requests
      if (request.userId._id.toString() !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden. You can only view your own requests.' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      request
    });
    
  } catch (error) {
    logWithTimestamp(`Request fetch error: ${error.message}`, 'error');
    console.error('Request fetch error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}
