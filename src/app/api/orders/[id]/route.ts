import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const { status } = await request.json();
    
    const orders = await redis.get('orders') || [];
    const orderArray = Array.isArray(orders) ? orders : [];
    
    const index = orderArray.findIndex((o: any) => o.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }
    
    orderArray[index].status = status;
    await redis.set('orders', orderArray);
    
    return NextResponse.json(orderArray[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la commande' }, { status: 500 });
  }
}