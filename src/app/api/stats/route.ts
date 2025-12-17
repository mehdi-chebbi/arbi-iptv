import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    const products = await redis.get('products') || [];
    const orders = await redis.get('orders') || [];
    
    const productArray = Array.isArray(products) ? products : [];
    const orderArray = Array.isArray(orders) ? orders : [];
    
    const totalProducts = productArray.length;
    const totalOrders = orderArray.length;
    
    const totalRevenue = orderArray.reduce((sum: number, order: any) => {
      return sum + (order.total || 0);
    }, 0);
    
    const soldOrders = orderArray.filter((order: any) => order.status === 'vendue');
    const soldProducts = new Map();
    
    soldOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        const current = soldProducts.get(item.name) || 0;
        soldProducts.set(item.name, current + item.quantity);
      });
    });
    
    const topProducts = Array.from(soldProducts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));
    
    const stats = {
      totalProducts,
      totalOrders,
      totalRevenue,
      topProducts
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du calcul des statistiques' }, { status: 500 });
  }
}