import redis from '@/lib/redis';
import { promises as fs } from 'fs';
import path from 'path';

async function migrateData() {
  try {
    console.log('Starting migration to Redis...');

    // Read existing data from JSON files
    const productsData = await fs.readFile(path.join(process.cwd(), 'data', 'products.json'), 'utf8');
    const ordersData = await fs.readFile(path.join(process.cwd(), 'data', 'orders.json'), 'utf8');
    const adminData = await fs.readFile(path.join(process.cwd(), 'data', 'admin.json'), 'utf8');

    const products = JSON.parse(productsData);
    const orders = JSON.parse(ordersData);
    const admin = JSON.parse(adminData);

    // Migrate to Redis
    await redis.set('products', products.products);
    await redis.set('orders', orders.orders);
    await redis.set('admin', admin.admin);

    console.log('✅ Products migrated:', products.products.length, 'items');
    console.log('✅ Orders migrated:', orders.orders.length, 'items');
    console.log('✅ Admin credentials migrated');

    // Verify migration
    const migratedProducts = await redis.get('products');
    const migratedOrders = await redis.get('orders');
    const migratedAdmin = await redis.get('admin');

    console.log('✅ Verification - Products in Redis:', Array.isArray(migratedProducts) ? migratedProducts.length : 0);
    console.log('✅ Verification - Orders in Redis:', Array.isArray(migratedOrders) ? migratedOrders.length : 0);
    console.log('✅ Verification - Admin in Redis:', migratedAdmin ? 'Present' : 'Missing');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
migrateData();