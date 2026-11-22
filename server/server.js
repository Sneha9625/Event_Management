// Local development / traditional hosting (Render, Railway...): start a normal server.
// On Vercel this file is NOT used — see api/index.js.
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    // No point running the API without a database
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  });
