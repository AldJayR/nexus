import { buildApp } from './app.js';
import { env } from './config/env.js';
import { disconnectDatabase, checkDatabaseHealth } from './utils/database.js';

async function start() {
  const app = await buildApp();

  try {
    // Check database connection before starting
    const isDbHealthy = await checkDatabaseHealth();
    if (!isDbHealthy) {
      app.log.error('❌ Database connection failed. Exiting...');
      process.exit(1);
    }
    app.log.info('✅ Database connected successfully');

    // Start Server
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    
    const address = app.server.address();
    const port = typeof address === 'string' ? address : address?.port;
    
    app.log.info(`🚀 Server running at http://localhost:${port}`);
    app.log.info(`Health check: http://localhost:${port}/health`);
    app.log.info(`API v1: http://localhost:${port}/api/v1`);

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful Shutdown
  const signals = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down...`);
      await app.close();
      await disconnectDatabase();
      process.exit(0);
    });
  }
}

start();
