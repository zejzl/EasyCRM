import app from './app';

const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
  console.log(`[START] API Server running on port ${PORT}`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[INFO] Health check: http://localhost:${PORT}/health`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('[ERROR] Unhandled Rejection:', err);
  process.exit(1);
});
