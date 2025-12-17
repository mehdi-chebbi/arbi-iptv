import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    const products = await redis.get('products');
    return NextResponse.json(products || []);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la lecture des produits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newProduct = await request.json();
    const existingProducts = await redis.get('products') || [];
    const products = Array.isArray(existingProducts) ? existingProducts : [];
    
    const maxId = Math.max(...products.map((p: any) => p.id), 0);
    newProduct.id = maxId + 1;
    
    products.push(newProduct);
    await redis.set('products', products);
    
    return NextResponse.json(newProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'ajout du produit' }, { status: 500 });
  }
}