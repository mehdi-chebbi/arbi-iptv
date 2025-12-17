import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const updatedProduct = await request.json();
    
    const products = await redis.get('products') || [];
    const productArray = Array.isArray(products) ? products : [];
    
    const index = productArray.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }
    
    productArray[index] = { ...productArray[index], ...updatedProduct };
    await redis.set('products', productArray);
    
    return NextResponse.json(productArray[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du produit' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const products = await redis.get('products') || [];
    const productArray = Array.isArray(products) ? products : [];
    
    const index = productArray.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }
    
    productArray.splice(index, 1);
    await redis.set('products', productArray);
    
    return NextResponse.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression du produit' }, { status: 500 });
  }
}