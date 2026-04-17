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
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: result.user, 
      token: result.token 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
