import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { logWithTimestamp } from '@/lib/utils';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

/**
 * @swagger
 * /api/admin/broadcast:
 *   post:
 *     summary: Broadcast notification to users (admin only)
 *     description: Send notification to all users, volunteers, or specific region
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message, audience]
 *             properties:
 *               message:
 *                 type: string
 *               audience:
 *                 type: string
 *                 enum: [all, volunteers, users, region]
 *               region:
 *                 type: string
 *                 description: Required if audience is 'region'
 *     responses:
 *       200:
 *         description: Broadcast sent successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
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
    const { message, audience, region } = body;
    
    if (!message || !audience) {
      return NextResponse.json(
        { success: false, error: 'Message and audience are required' },
        { status: 400 }
      );
    }
    
    const validAudiences = ['all', 'volunteers', 'users', 'region'];
    if (!validAudiences.includes(audience)) {
      return NextResponse.json(
        { success: false, error: 'Invalid audience type' },
        { status: 400 }
      );
    }
    
    if (audience === 'region' && !region) {
      return NextResponse.json(
        { success: false, error: 'Region is required for regional broadcasts' },
        { status: 400 }
      );
    }
    
    // Log broadcast
    logWithTimestamp(`Admin ${session.user.email} sent broadcast to ${audience}${region ? ` (${region})` : ''}: ${message.substring(0, 100)}`, 'info');
    
    // Build query to find recipients
    let recipientQuery = { status: 'approved' };
    
    if (audience === 'volunteers') {
      recipientQuery.role = { $in: ['volunteer', 'emergency_volunteer'] };
    } else if (audience === 'users') {
      recipientQuery.role = 'user';
    } else if (audience === 'region') {
      recipientQuery['address.division'] = region;
    }
    // 'all' = no additional filter
    
    // Get recipient IDs
    const recipients = await User.find(recipientQuery).select('_id').lean();
    
    if (recipients.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No recipients found',
        count: 0
      });
    }
    
    // Create notifications for all recipients
    const notifications = recipients.map(recipient => ({
      recipientId: recipient._id,
      type: 'broadcast',
      title: '📢 System Broadcast',
      message,
      metadata: {
        audience,
        region: region || null,
        sentBy: session.user.email
      }
    }));
    
    await Notification.insertMany(notifications);
    
    return NextResponse.json({
      success: true,
      message: 'Broadcast sent successfully',
      count: recipients.length,
      audience,
      region: region || null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logWithTimestamp(`Broadcast error: ${error.message}`, 'error');
    return NextResponse.json(
      { success: false, error: 'Failed to send broadcast' },
      { status: 500 }
    );
  }
}
