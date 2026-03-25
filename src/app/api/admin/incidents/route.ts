import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { getActiveMongoUri } from '@/lib/db';
import Incident from '@/models/Incident';
import { getAdminSessionFromRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    const session = getAdminSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const incidents = await Incident.find({}).sort({ createdAt: -1 });
    const activeUri = getActiveMongoUri() || '';
    const connectionMode = activeUri.includes('localhost') ? 'fallback-local' : 'primary';

    return NextResponse.json(
      {
        success: true,
        data: incidents,
        meta: {
          connectionMode,
          usedFallback: connectionMode === 'fallback-local',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin incidents:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch admin incidents';
    const isTlsIssue =
      message.includes('tlsv1 alert internal error') ||
      message.includes('SSL routines:ssl3_read_bytes');

    return NextResponse.json(
      {
        success: false,
        error: isTlsIssue
          ? 'MongoDB TLS handshake failed for Atlas. Configure MONGODB_FALLBACK_URI for continuity or fix Atlas network/TLS settings.'
          : 'Failed to fetch admin incidents',
      },
      { status: 500 }
    );
  }
}
