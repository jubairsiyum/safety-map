import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Incident from '@/models/Incident';

function formatIncidentApiError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';

  if (
    message.includes('MONGODB_URI') ||
    message.includes('ECONNREFUSED') ||
    message.includes('Server selection timed out')
  ) {
    return 'Database connection failed. Check MONGODB_URI and ensure MongoDB is running.';
  }

  return message;
}

export async function GET() {
  try {
    await dbConnect();
    const incidents = await Incident.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: incidents }, { status: 200 });
  } catch (error: unknown) {
    const friendlyError = formatIncidentApiError(error);
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { success: false, error: friendlyError },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await dbConnect();

    const incident = await Incident.create(body);

    return NextResponse.json(
      { success: true, data: incident },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating incident:', error);

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

    const friendlyError = formatIncidentApiError(error);

    return NextResponse.json(
      { success: false, error: friendlyError },
      { status: 500 }
    );
  }
}
