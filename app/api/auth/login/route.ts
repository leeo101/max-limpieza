import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }
    
    const result = await authenticateUser(email, password);
    if (!result) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
