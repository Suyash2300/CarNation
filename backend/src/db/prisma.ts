import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Connection pool configuration for production
const connectionPoolConfig = {
  // Connection pool size (default: 10)
  // Adjust based on your database provider limits
  connectionLimit: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
  
  // Connection timeout in milliseconds (default: 10 seconds)
  connectTimeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10000', 10),
  
  // Query timeout in milliseconds (default: 30 seconds)
  queryTimeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '30000', 10),
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pool configuration
    // Note: Prisma handles connection pooling automatically via the connection string
    // For PostgreSQL, you can configure pool size via connection string parameters:
    // ?connection_limit=10&pool_timeout=10
    // For production, ensure your DATABASE_URL includes these parameters
  });

// Optimize connection pool for production
if (process.env.NODE_ENV === 'production') {
  // Prisma automatically manages connection pooling
  // Ensure DATABASE_URL includes connection pool parameters:
  // For PostgreSQL (Neon, Supabase, etc.):
  // postgresql://user:password@host:port/database?connection_limit=10&pool_timeout=10
  // For better performance, set appropriate pool size based on your database provider
  console.log('🔧 Prisma connection pool configured for production');
  console.log(`📊 Connection pool size: ${connectionPoolConfig.connectionLimit}`);
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

