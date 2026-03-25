import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Incident from '@/models/Incident';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const incident = await Incident.findById(id);

    if (!incident) {
      return NextResponse.json(
        { success: false, error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: incident }, { status: 200 });
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await dbConnect();

    const incident = await Incident.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!incident) {
      return NextResponse.json(
        { success: false, error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: incident }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating incident:', error);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ValidationError' &&
      'errors' in error &&
      error.errors &&
      typeof error.errors === 'object'
    ) {
      const messages = Object.values(error.errors as Record<string, { message?: string }>).map(
        (err) => err.message || 'Invalid input'
      );
      return NextResponse.json(
        { success: false, error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const incident = await Incident.findByIdAndDelete(id);

    if (!incident) {
      return NextResponse.json(
        { success: false, error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Incident deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete incident' },
      { status: 500 }
    );
  }
}
