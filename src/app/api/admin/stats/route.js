import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Request from '@/lib/models/Request';
import Shelter from '@/lib/models/Shelter';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics (admin only)
 *     description: Returns counts and metrics for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics data
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
    
    // Get user statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVolunteers = await User.countDocuments({ 
      role: { $in: ['volunteer', 'emergency_volunteer'] }
    });
    const pendingApprovals = await User.countDocuments({ status: 'pending' });
    
    // Get request statistics
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const assignedRequests = await Request.countDocuments({ status: 'assigned' });
    const inProgressRequests = await Request.countDocuments({ status: 'in_progress' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    
    // Request by type
    const requestsByType = await Request.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Request by priority
    const requestsByPriority = await Request.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Shelter statistics
    const totalShelters = await Shelter.countDocuments();
    const activeShelters = await Shelter.countDocuments({ status: 'active' });
    
    const shelterCapacity = await Shelter.aggregate([
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$capacity' },
          totalOccupancy: { $sum: '$currentOccupancy' }
        }
      }
    ]);
    
    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          volunteers: totalVolunteers,
          pendingApprovals
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          assigned: assignedRequests,
          inProgress: inProgressRequests,
          completed: completedRequests,
          byType: requestsByType,
          byPriority: requestsByPriority
        },
        shelters: {
          total: totalShelters,
          active: activeShelters,
          capacity: shelterCapacity[0] || { totalCapacity: 0, totalOccupancy: 0 }
        }
      }
    });
    
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
