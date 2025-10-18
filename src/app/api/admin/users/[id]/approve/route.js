import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { logWithTimestamp } from '@/lib/utils';

/**
 * @swagger
 * /api/admin/users/{id}/approve:
 *   post:
 *     summary: Approve a user account (admin only)
 *     description: Change user status from pending to approved
 *     tags: [Admin]
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
 *         description: User approved successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const { id } = params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    user.status = 'approved';
    user.updatedAt = new Date();
    await user.save();
    
    logWithTimestamp(`Admin ${session.user.email} approved user ${user.email} (ID: ${id})`, 'info');
    
    // Create notification for user
    await Notification.create({
      recipientId: user._id,
      type: 'account_approved',
      title: '✅ Account Approved!',
      message: `Congratulations! Your account has been approved. You can now access all features.`,
      link: '/dashboard'
    });
    
    // In production, send email notification to user here
    
    return NextResponse.json({
      success: true,
      message: 'User approved successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
    
  } catch (error) {
    logWithTimestamp(`User approval error: ${error.message}`, 'error');
    console.error('User approval error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to approve user' },
      { status: 500 }
    );
  }
}
