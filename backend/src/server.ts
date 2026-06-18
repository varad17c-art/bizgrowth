import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config();

import app from './app';
import { verifyConnection } from './config/db';

// ============================================================
// Server Bootstrap
// ============================================================

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async (): Promise<void> => {
  try {
    // 1. Verify Supabase connectivity
    await verifyConnection();

    // 2. Start Express server
    app.listen(PORT, () => {
      console.log(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   🚀 BizGrowth API Server                   ║
  ║                                              ║
  ║   Port:        ${String(PORT).padEnd(28)}║
  ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(28)}║
  ║   Database:    ${'Supabase (PostgreSQL)'.padEnd(28)}║
  ║   URL:         http://localhost:${String(PORT).padEnd(14)}║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    const err = error as Error;
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// ---- Graceful Shutdown ----
const gracefulShutdown = (signal: string): void => {
  console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ---- Unhandled Rejections & Exceptions ----
process.on('unhandledRejection', (reason: unknown) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

// ---- Start ----
startServer();
