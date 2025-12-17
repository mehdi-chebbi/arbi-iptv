import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    const orders = await redis.get('orders');
    return NextResponse.json(orders || []);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la lecture des commandes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newOrder = await request.json();
    const existingOrders = await redis.get('orders') || [];
    const orders = Array.isArray(existingOrders) ? existingOrders : [];
    
    const maxId = Math.max(...orders.map((o: any) => o.id || 0), 0);
    newOrder.id = maxId + 1;
    newOrder.date = new Date().toISOString();
    newOrder.status = 'en attente';
    
    orders.push(newOrder);
    await redis.set('orders', orders);
    
    return NextResponse.json(newOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 });
  }
}