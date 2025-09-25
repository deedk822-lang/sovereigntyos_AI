const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sovereign-manus' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    node_version: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// System info endpoint
app.get('/info', (req, res) => {
  res.json({
    name: 'sovereign-manus',
    description: 'SovereigntyOS AI Workflow Automation Platform',
    version: '1.0.0',
    build: process.env.BUILD_ID || 'local',
    commit: process.env.COMMIT_SHA || 'unknown',
    branch: process.env.BRANCH_NAME || 'main'
  });
});

// Workflow trigger endpoints placeholder
app.post('/workflows/:name/trigger',
  body('payload').optional().isObject(),
  body('priority').optional().isIn(['low', 'normal', 'high']),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.params;
    const { payload, priority = 'normal' } = req.body;

    logger.info(`Workflow trigger requested: ${name}`, { payload, priority });

    // TODO: Implement actual workflow triggering logic
    res.json({
      status: 'triggered',
      workflow: name,
      jobId: `job-${Date.now()}`,
      priority,
      timestamp: new Date().toISOString()
    });
  }
);

// Workflow status endpoint
app.get('/workflows/:name/status/:jobId', (req, res) => {
  const { name, jobId } = req.params;
  
  logger.info(`Status check requested: ${name}/${jobId}`);

  // TODO: Implement actual status checking logic
  res.json({
    workflow: name,
    jobId,
    status: 'running',
    progress: Math.floor(Math.random() * 100),
    started_at: new Date(Date.now() - 60000).toISOString(),
    estimated_completion: new Date(Date.now() + 120000).toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`SovereigntyOS server listening on port ${PORT}`);
  logger.info('Environment:', process.env.NODE_ENV || 'development');
});

module.exports = app;