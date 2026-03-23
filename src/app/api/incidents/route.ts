import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Incident from '@/models/Incident';

export async function GET() {
  try {
    await dbConnect();
    const incidents = await Incident.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: incidents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch incidents' },
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
  } catch (error: any) {
    console.error('Error creating incident:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}
