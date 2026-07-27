const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');

const { getEnv } = require('./config/env');
const swaggerSpec = require('./config/swagger');
const paymentRoutes = require('./routes/paymentRoutes');
const requestLogger = require('./middlewares/requestLogger');
const localizeMiddleware = require('./middlewares/localizeMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
const cardStore = require('./models/cardStore');

const app = express();
const env = getEnv();

const allowedOrigins = (env.CORS_ALLOWED_ORIGINS || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);

// Security & Parsing Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS origin is not allowed'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(hpp());

// Custom Middlewares
app.use(requestLogger);
app.use(localizeMiddleware);

// Initialize data layer
cardStore.ensureDataFile();

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payment Gateway Simulator is running'
  });
});

// API Routes
app.use('/api/payments', paymentRoutes);

// 404 Handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    errorCode: 'CARD_NOT_FOUND',
    message: `Route ${req.originalUrl} not found`
  });
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
