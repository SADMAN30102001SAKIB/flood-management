import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shelter from '@/lib/models/Shelter';
import { logWithTimestamp } from '@/lib/utils';

/**
 * @swagger
 * /api/admin/shelters/{id}:
 *   get:
 *     summary: Get shelter details
 *   put:
 *     summary: Update shelter
 *   delete:
 *     summary: Delete shelter
 */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const shelter = await Shelter.findById(params.id);
    
    if (!shelter) {
      return NextResponse.json(
        { success: false, error: 'Shelter not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, shelter });
    
  } catch (error) {
    logWithTimestamp(`Shelter fetch error: ${error.message}`, 'error');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shelter' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
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
    
    const shelter = await Shelter.findById(params.id);
    
    if (!shelter) {
      return NextResponse.json(
        { success: false, error: 'Shelter not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (body.name) shelter.name = body.name;
    if (body.capacity !== undefined) shelter.capacity = body.capacity;
    if (body.currentOccupancy !== undefined) shelter.currentOccupancy = body.currentOccupancy;
    if (body.address) shelter.address = { ...shelter.address, ...body.address };
    if (body.contact) shelter.contact = { ...shelter.contact, ...body.contact };
    if (body.facilities) shelter.facilities = body.facilities;
    if (body.status) shelter.status = body.status;
    
    shelter.updatedAt = new Date();
    await shelter.save();
    
    logWithTimestamp(`Shelter ${params.id} updated`, 'info');
    
    return NextResponse.json({
      success: true,
      shelter,
      message: 'Shelter updated successfully'
    });
    
  } catch (error) {
    logWithTimestamp(`Shelter update error: ${error.message}`, 'error');
    return NextResponse.json(
      { success: false, error: 'Failed to update shelter' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const shelter = await Shelter.findByIdAndDelete(params.id);
    
    if (!shelter) {
      return NextResponse.json(
        { success: false, error: 'Shelter not found' },
        { status: 404 }
      );
    }
    
    logWithTimestamp(`Shelter ${params.id} deleted`, 'info');
    
    return NextResponse.json({
      success: true,
      message: 'Shelter deleted successfully'
    });
    
  } catch (error) {
    logWithTimestamp(`Shelter deletion error: ${error.message}`, 'error');
    return NextResponse.json(
      { success: false, error: 'Failed to delete shelter' },
      { status: 500 }
    );
  }
}
