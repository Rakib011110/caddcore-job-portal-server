/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import './config/cloudinary'; // Initialize Cloudinary
import { shutdownPdfEngine } from './app/modules/Resume/resume.pdf';

let server: Server;

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  if (server) {
    server.close(() => {
      console.error('Server closed due to unhandled rejection');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

async function bootstrap() {
  try {
    await mongoose.connect(config.db_url as string);
    console.log('🛢 Database connected successfully');
    // await seed();
    server = app.listen(config.port, () => {
      console.log(`🚀 Application is running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  } 
}

bootstrap();

/**
 * Close the shared Chromium used for CV PDF export.
 *
 * It runs as a child process, so without this a restarted server leaves an
 * orphaned browser holding a few hundred MB per restart.
 */
const shutdown = (signal: string) => {
  console.log(`${signal} received`);

  const exit = () => {
    shutdownPdfEngine()
      .catch(() => undefined)
      .finally(() => process.exit(0));
  };

  if (server) {
    server.close(() => {
      console.log(`Server closed due to ${signal}`);
      exit();
    });
  } else {
    exit();
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));