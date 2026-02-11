/**
 * Mindforge Backend — Server Entry Point
 *
 * Starts the Express server. Separated from app.js for testability.
 */

'use strict';

const createApp = require('./app');
const config = require('./config');

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(
    `[Mindforge] Server running on port ${config.port} (${config.nodeEnv})`
  );
  console.log(`[Mindforge] Health check: http://localhost:${config.port}/health`);
});

// ── Graceful shutdown ─────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[Mindforge] ${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('[Mindforge] Server closed.');
    process.exit(0);
  });

  // Force exit after 10s if connections hang
  setTimeout(() => {
    console.error('[Mindforge] Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Unhandled rejection / exception safety net ────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[Mindforge] Unhandled Rejection:', reason);
  // In production, you may want to restart via process manager
});

process.on('uncaughtException', (err) => {
  console.error('[Mindforge] Uncaught Exception:', err);
  process.exit(1);
});

module.exports = server;
