const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const webhookRoutes = require('./routes/webhooks');

const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
});


app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', authenticateToken, ticketRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/webhook', webhookRoutes);


app.get('/me/screens', authenticateToken, (req, res) => {
  const registry = require('./config/registry.json');
  const userScreens = registry.tenants[req.user.customerId] || [];
  res.json({ screens: userScreens });
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});


app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowbit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch((err) => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});


app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;