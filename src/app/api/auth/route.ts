import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const admin = await redis.get('admin');
    
    if (username === admin?.username && password === admin?.password) {
      return NextResponse.json({ success: true, message: 'Authentification réussie' });
    } else {
      return NextResponse.json({ success: false, message: 'Identifiants incorrects' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erreur lors de l\'authentification' }, { status: 500 });
  }
}