const mongoose = require('mongoose');

const connectDB = async (retries = 10, delay = 2500) => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_grocery_db';
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.error(`[Database Connection Attempt ${attempt}/${retries}]: ${error.message}`);
      if (attempt === retries) {
        console.error('[Database Error] Max retries reached. Exiting...');
        process.exit(1);
      }
      console.log(`[Database] Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
