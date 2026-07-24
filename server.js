require('dotenv').config();

const validateEnv = require('./src/config/env');

validateEnv();

const app = require('./src/app');

const PORT = process.env.PORT || 3001;

let server;

const shutdown = (reason, error) => {
  console.error(`[SHUTDOWN] ${reason}`, error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  shutdown('Uncaught exception', error);
});

process.on('unhandledRejection', (error) => {
  shutdown('Unhandled rejection', error);
});

server = app.listen(PORT, () => {
  console.log(`\n💳 Payment Gateway Simulator running on http://localhost:${PORT}`);
  console.log(`   Swagger Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`   Health Check: http://localhost:${PORT}/health\n`);
});
