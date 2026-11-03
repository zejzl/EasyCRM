import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from 'dotenv';
import { corsOrigins } from './config/cors';
import { rateLimit } from 'express-rate-limit';

// Load environment variables
config();

// Import routes
import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import contactRoutes from './routes/contact.routes';
import dealRoutes from './routes/deal.routes';
import activityRoutes from './routes/activity.routes';
import userRoutes from './routes/user.routes';
import analyticsRoutes from './routes/analytics.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { authenticate } from './middleware/auth.middleware';

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: corsOrigins(),
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', authenticate, companyRoutes);
app.use('/api/contacts', authenticate, contactRoutes);
app.use('/api/deals', authenticate, dealRoutes);
app.use('/api/activities', authenticate, activityRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

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
