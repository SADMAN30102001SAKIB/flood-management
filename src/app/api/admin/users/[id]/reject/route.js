import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { logWithTimestamp } from '@/lib/utils';

/**
 * @swagger
 * /api/admin/users/{id}/reject:
 *   post:
 *     summary: Reject a user account (admin only)
 *     description: Change user status from pending to rejected
 *     tags: [Admin]
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
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User rejected successfully
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
    const body = await req.json();
    
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    user.status = 'rejected';
    user.updatedAt = new Date();
    await user.save();
    
    logWithTimestamp(`Admin ${session.user.email} rejected user ${user.email} (ID: ${id}). Reason: ${body.reason || 'Not specified'}`, 'info');
    
    // Create notification for user
    await Notification.create({
      recipientId: user._id,
      type: 'account_rejected',
      title: '❌ Account Status',
      message: body.reason ? `Your account application was not approved. Reason: ${body.reason}` : 'Your account application was not approved. Please contact support for more information.',
      metadata: { reason: body.reason || null }
    });
    
    // In production, send email notification to user here
    
    return NextResponse.json({
      success: true,
      message: 'User rejected successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
    
  } catch (error) {
    logWithTimestamp(`User rejection error: ${error.message}`, 'error');
    console.error('User rejection error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to reject user' },
      { status: 500 }
    );
  }
}
