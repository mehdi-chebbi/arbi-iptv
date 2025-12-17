import redis from '@/lib/redis';

async function testRedisConnection() {
  try {
    console.log('Testing Redis connection...');
    
    // Test basic connection
    const pong = await redis.ping();
    console.log('✅ Redis ping response:', pong);
    
    // Test getting products
    const products = await redis.get('products');
    console.log('✅ Products retrieved:', Array.isArray(products) ? products.length : 'Not an array');
    
    // Test getting orders
    const orders = await redis.get('orders');
    console.log('✅ Orders retrieved:', Array.isArray(orders) ? orders.length : 'Not an array');
    
    // Test getting admin
    const admin = await redis.get('admin');
    console.log('✅ Admin retrieved:', admin ? 'Present' : 'Missing');
    
    console.log('🎉 Redis connection test successful!');
  } catch (error) {
    console.error('❌ Redis connection test failed:', error);
  }
}

testRedisConnection();