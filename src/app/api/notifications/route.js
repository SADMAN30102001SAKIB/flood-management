import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { logWithTimestamp } from '@/lib/utils';

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieve notifications for the authenticated user with pagination
 *     tags: [Notifications]
 *     parameters:
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
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: readOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const readOnly = searchParams.get('readOnly') === 'true';
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { recipientId: session.user.id };
    if (unreadOnly) {
      query.isRead = false;
    } else if (readOnly) {
      query.isRead = true;
    }
    
    // Get notifications
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select('-__v')
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipientId: session.user.id, isRead: false })
    ]);
    
    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount
    });
    
  } catch (error) {
    logWithTimestamp(`Get notifications error: ${error.message}`, 'error');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification (admin only)
 *     description: Create a new notification for a specific user
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientId, title, message]
 *             properties:
 *               recipientId:
 *                 type: string
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               link:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully
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
    const { recipientId, type, title, message, link, metadata } = body;
    
    if (!recipientId || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'RecipientId, title, and message are required' },
        { status: 400 }
      );
    }
    
    const notification = await Notification.create({
      recipientId,
      type: type || 'general',
      title,
      message,
      link,
      metadata: metadata || {}
    });
    
    logWithTimestamp(`Admin ${session.user.email} created notification for user ${recipientId}`, 'info');
    
    return NextResponse.json({
      success: true,
      notification
    }, { status: 201 });
    
  } catch (error) {
    logWithTimestamp(`Create notification error: ${error.message}`, 'error');
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
