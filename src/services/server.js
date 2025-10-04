/**
 * @file This file sets up and runs the Express.js server for the SovereigntyOS AI platform.
 * It configures middleware for security, logging, rate limiting, and compression.
 * It also defines the core API endpoints for health checks, system information,
 * and interacting with the workflow management system.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
require('dotenv').config();

// --- Initialization ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Logger Configuration ---
/**
 * Configures the Winston logger for the application.
 * Logs are output to the console and to files in the `logs/` directory.
 * @type {winston.Logger}
 */
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

// --- Core Middleware ---

/**
 * Applies essential security headers using Helmet.
 */
app.use(helmet());

/**
 * Enables Cross-Origin Resource Sharing (CORS) with a configurable origin.
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

/**
 * Sets up rate limiting to prevent abuse.
 * Limits each IP to 100 requests per 15 minutes.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

/**
 * Compresses response bodies for better performance.
 */
app.use(compression());

/**
 * Parses incoming JSON and URL-encoded payloads.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * Middleware to log incoming requests.
 */
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});


// --- API Endpoints ---

/**
 * @api {get} /health Health Check
 * @apiName GetHealth
 * @apiGroup System
 * @apiDescription Provides a health check endpoint to verify server status and uptime.
 * @apiSuccess {String} status The status of the server ("ok").
 * @apiSuccess {String} timestamp The current server timestamp.
 * @apiSuccess {Number} uptime The server's uptime in seconds.
 */
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

/**
 * @api {get} /info System Information
 * @apiName GetInfo
 * @apiGroup System
 * @apiDescription Provides build and version information about the running service.
 * @apiSuccess {String} name The name of the service.
 * @apiSuccess {String} version The version of the service.
 * @apiSuccess {String} build The build identifier.
 */
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

/**
 * @api {post} /workflows/:name/trigger Trigger Workflow
 * @apiName TriggerWorkflow
 * @apiGroup Workflows
 * @apiParam {String} name The name of the workflow to trigger.
 * @apiBody {Object} [payload] The input data for the workflow job.
 * @apiBody {String} [priority="normal"] The priority of the job ('low', 'normal', 'high').
 * @apiDescription Endpoint to trigger a new workflow job. (Placeholder implementation)
 * @apiSuccess {String} status The status of the trigger request.
 * @apiSuccess {String} workflow The name of the triggered workflow.
 * @apiSuccess {String} jobId A unique identifier for the created job.
 */
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

    // TODO: Replace with actual call to SovereignWorkflowManager.triggerWorkflow
    res.json({
      status: 'triggered',
      workflow: name,
      jobId: `job-${Date.now()}`,
      priority,
      timestamp: new Date().toISOString()
    });
  }
);

/**
 * @api {get} /workflows/:name/status/:jobId Get Job Status
 * @apiName GetJobStatus
 * @apiGroup Workflows
 * @apiParam {String} name The name of the workflow.
 * @apiParam {String} jobId The ID of the job to check.
 * @apiDescription Retrieves the status of a specific workflow job. (Placeholder implementation)
 * @apiSuccess {String} status The current status of the job.
 * @apiSuccess {Number} progress The job's progress percentage.
 */
app.get('/workflows/:name/status/:jobId', (req, res) => {
  const { name, jobId } = req.params;
  logger.info(`Status check requested: ${name}/${jobId}`);

  // TODO: Replace with actual call to SovereignWorkflowManager.getJobStatus
  res.json({
    workflow: name,
    jobId,
    status: 'running',
    progress: Math.floor(Math.random() * 100),
    started_at: new Date(Date.now() - 60000).toISOString(),
    estimated_completion: new Date(Date.now() + 120000).toISOString()
  });
});

// --- Error Handling ---

/**
 * Final error handling middleware. Catches any unhandled errors from the routes.
 */
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', { message: err.message, stack: err.stack, path: req.path });
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

/**
 * 404 handler for routes that are not found.
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// --- Server Lifecycle ---

/**
 * Handles graceful shutdown on SIGTERM and SIGINT signals.
 */
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  // Here you could add cleanup logic, like closing database connections
  process.exit(0);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Starts the Express server and listens on the configured port.
 */
app.listen(PORT, () => {
  logger.info(`SovereigntyOS server listening on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;