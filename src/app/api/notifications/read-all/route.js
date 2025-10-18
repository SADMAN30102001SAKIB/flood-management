import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { logWithTimestamp } from '@/lib/utils';

/**
 * Mark all notifications as read for the authenticated user
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const result = await Notification.updateMany(
      { recipientId: session.user.id, isRead: false },
      { 
        isRead: true,
        readAt: new Date()
      }
    );
    
    return NextResponse.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`
    });
    
  } catch (error) {
    logWithTimestamp(`Mark all notifications read error: ${error.message}`, 'error');
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
