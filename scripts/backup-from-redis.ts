import redis from '@/lib/redis';
import { promises as fs } from 'fs';
import path from 'path';

async function backupFromRedis() {
  try {
    console.log('Starting backup from Redis...');

    // Get data from Redis
    const products = await redis.get('products');
    const orders = await redis.get('orders');
    const admin = await redis.get('admin');

    // Create backup data structure
    const backupData = {
      products: { products: products || [] },
      orders: { orders: orders || [] },
      admin: { admin: admin || {} },
      backupDate: new Date().toISOString()
    };

    // Write backup files
    await fs.writeFile(
      path.join(process.cwd(), 'data', 'products-backup.json'),
      JSON.stringify({ products: products || [] }, null, 2)
    );

    await fs.writeFile(
      path.join(process.cwd(), 'data', 'orders-backup.json'),
      JSON.stringify({ orders: orders || [] }, null, 2)
    );

    await fs.writeFile(
      path.join(process.cwd(), 'data', 'admin-backup.json'),
      JSON.stringify({ admin: admin || {} }, null, 2)
    );

    await fs.writeFile(
      path.join(process.cwd(), 'data', 'full-backup.json'),
      JSON.stringify(backupData, null, 2)
    );

    console.log('✅ Products backed up:', Array.isArray(products) ? products.length : 0, 'items');
    console.log('✅ Orders backed up:', Array.isArray(orders) ? orders.length : 0, 'items');
    console.log('✅ Admin backed up:', admin ? 'Present' : 'Missing');

    console.log('🎉 Backup completed successfully!');
    console.log('📁 Backup files created in /data directory');
  } catch (error) {
    console.error('❌ Backup failed:', error);
  }
}

// Run backup
backupFromRedis();