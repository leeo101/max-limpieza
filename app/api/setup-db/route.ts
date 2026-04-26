import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const secret = process.env.SETUP_PASSWORD;

    if (!secret || token !== secret) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized. Please provide a valid SETUP_PASSWORD in .env and pass it as ?token=...' 
      }, { status: 401 });
    }

    await initializeDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
