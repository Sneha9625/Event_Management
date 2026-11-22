const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// The Express app on its own (no app.listen here), so it can be used both by
// server.js (local / Render) and by api/index.js (Vercel serverless).
const app = express();

// Render/Vercel sit behind a proxy; this lets express-rate-limit see the real client IP.
app.set('trust proxy', 1);

// Only our frontend may call the API from a browser. CLIENT_URL can hold
// several comma-separated origins (e.g. local + deployed).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, '')); // ignore a trailing slash
app.use(cors({ origin: allowedOrigins }));

app.use(express.json({ limit: '1mb' }));

// Health check — handy for a quick "is it up?" test after deploying
app.get('/', (req, res) => {
  res.json({ success: true, message: 'EventHub API is running', data: null });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// These must come AFTER the routes
app.use(notFound);
app.use(errorHandler);

module.exports = app;
