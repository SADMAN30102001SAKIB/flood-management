import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Request from '@/lib/models/Request';
import Notification from '@/lib/models/Notification';
import { logWithTimestamp } from '@/lib/utils';

/**
 * @swagger
 * /api/requests/{id}/status:
 *   post:
 *     summary: Update request status (volunteer/admin only)
 *     description: Change request status (in_progress, completed, rejected)
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [in_progress, completed, rejected]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status
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
    
    // Only volunteers and admins can update status
    if (!['volunteer', 'emergency_volunteer', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Only volunteers and admins can update request status.' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const { id } = params;
    const body = await req.json();
    
    const { status, notes } = body;
    
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }
    
    const validStatuses = ['in_progress', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    const request = await Request.findById(id);
    
    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }
    
    // Volunteers can only update requests assigned to them
    if (session.user.role !== 'admin') {
      if (!request.assignedVolunteerId || request.assignedVolunteerId.toString() !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden. You can only update requests assigned to you.' },
          { status: 403 }
        );
      }
    }
    
    const oldStatus = request.status;
    request.status = status;
    request.updatedAt = new Date();
    await request.save();
    
    logWithTimestamp(`Request ${id} status changed from ${oldStatus} to ${status} by ${session.user.email}. Notes: ${notes || 'None'}`, 'info');
    
    // Get status message
    const statusMessages = {
      in_progress: `Your "${request.type}" request is now in progress.`,
      completed: `Great news! Your "${request.type}" request has been completed. ${notes ? notes : 'Thank you for using our service.'}`,
      rejected: `Your "${request.type}" request could not be completed. ${notes ? 'Reason: ' + notes : 'Please contact support for more information.'}`
    };
    
    // Create notification for user who made the request
    await Notification.create({
      recipientId: request.userId,
      type: 'request_updated',
      title: '🔄 Request Status Update',
      message: statusMessages[status],
      link: `/dashboard/user`,
      metadata: {
        requestId: request._id,
        oldStatus,
        newStatus: status,
        requestType: request.type,
        notes: notes || null
      }
    });
    
    // In production, send email notification to user
    
    return NextResponse.json({
      success: true,
      message: 'Request status updated successfully',
      request: {
        id: request._id,
        status: request.status,
        updatedAt: request.updatedAt
      }
    });
    
  } catch (error) {
    logWithTimestamp(`Request status update error: ${error.message}`, 'error');
    console.error('Request status update error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to update request status' },
      { status: 500 }
    );
  }
}
