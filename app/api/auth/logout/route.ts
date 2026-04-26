import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Clear both possible tokens
  cookieStore.delete('userToken');
  cookieStore.delete('adminToken');
  
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
