// Vercel entry point. Vercel turns this file into a serverless function, and
// vercel.json sends every URL here. We make sure MongoDB is connected, then
// hand the request to the normal Express app.
require('dotenv').config();
const app = require('../app');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: 'Database unavailable, please try again', data: null }));
  }
  return app(req, res);
};
