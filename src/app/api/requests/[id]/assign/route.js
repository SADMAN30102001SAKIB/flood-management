import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Request from '@/lib/models/Request';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { logWithTimestamp } from '@/lib/utils';

/**
 * @swagger
 * /api/requests/{id}/assign:
 *   post:
 *     summary: Volunteer accepts a request
 *     description: Assigns the request to the volunteer and changes status to assigned
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               volunteerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request assigned successfully
 *       400:
 *         description: Request already assigned
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Request not found
 */
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }
    
    // Only volunteers can accept requests
    if (!['volunteer', 'emergency_volunteer', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Only volunteers can accept requests.' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const { id } = params;
    const body = await req.json();
    
    const volunteerId = body.volunteerId || session.user.id;
    
    const request = await Request.findById(id);
    
    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }
    
    // Check if already assigned
    if (request.assignedVolunteerId) {
      return NextResponse.json(
        { success: false, error: 'Request already assigned to another volunteer' },
        { status: 400 }
      );
    }
    
    // Check if request is pending
    if (request.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Cannot assign request with status: ${request.status}` },
        { status: 400 }
      );
    }
    
    // Assign volunteer
    request.assignedVolunteerId = volunteerId;
    request.status = 'assigned';
    request.assignedAt = new Date();
    request.updatedAt = new Date();
    await request.save();
    
    logWithTimestamp(`Volunteer ${session.user.email} accepted request ${id}`, 'info');
    
    // Get volunteer info
    const volunteer = await User.findById(volunteerId).select('name');
    
    // Create notification for user who made the request
    await Notification.create({
      recipientId: request.userId,
      type: 'request_assigned',
      title: '📋 Request Assigned',
      message: `A volunteer (${volunteer?.name || 'Volunteer'}) has accepted your "${request.type}" request. They will contact you soon.`,
      link: `/dashboard/user`,
      metadata: {
        requestId: request._id,
        volunteerId,
        requestType: request.type
      }
    });
    
    // In production, send notification to user
    
    return NextResponse.json({
      success: true,
      message: 'Request assigned successfully',
      request: {
        id: request._id,
        status: request.status,
        assignedVolunteerId: request.assignedVolunteerId,
        assignedAt: request.assignedAt
      }
    });
    
  } catch (error) {
    logWithTimestamp(`Request assignment error: ${error.message}`, 'error');
    console.error('Request assignment error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to assign request' },
      { status: 500 }
    );
  }
}
