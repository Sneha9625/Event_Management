const mongoose = require('mongoose');

// Remember the connection between calls. On Vercel each request may run in a
// fresh or a reused function instance — reusing the open connection avoids
// reconnecting to MongoDB on every request (slow, and can hit Atlas limits).
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection; // already connected

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn.connection;
      })
      .catch((error) => {
        connectionPromise = null; // allow a retry on the next request
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;
