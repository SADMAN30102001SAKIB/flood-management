import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';
import { calculateDistance } from '@/lib/utils';

/**
 * @swagger
 * /api/volunteers/nearby:
 *   get:
 *     summary: Get nearby emergency volunteers
 *     description: Find emergency volunteers within specified radius
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *           description: Radius in kilometers
 *     responses:
 *       200:
 *         description: List of nearby volunteers
 */
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
    const lat = parseFloat(searchParams.get('lat'));
    const lon = parseFloat(searchParams.get('lon'));
    const radius = parseFloat(searchParams.get('radius')) || 10; // Default 10km
    
    if (!lat || !lon) {
      return NextResponse.json(
        { success: false, error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }
    
    // Find emergency volunteers with approved status
    const volunteers = await User.find({
      role: 'emergency_volunteer',
      status: 'approved'
    })
    .select('-passwordHash')
    .lean();
    
    // For now, return all emergency volunteers
    // In production with geocoded addresses, filter by distance
    // const nearbyVolunteers = volunteers.filter(v => {
    //   if (v.location && v.location.coordinates) {
    //     const distance = calculateDistance(lat, lon, v.location.coordinates[1], v.location.coordinates[0]);
    //     return distance <= radius;
    //   }
    //   return false;
    // });
    
    return NextResponse.json({
      success: true,
      volunteers,
      count: volunteers.length
    });
    
  } catch (error) {
    console.error('Nearby volunteers fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch nearby volunteers' },
      { status: 500 }
    );
  }
}
