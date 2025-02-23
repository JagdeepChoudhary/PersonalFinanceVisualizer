import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log('✅ Already connected to the database');
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
// console.log(MONGODB_URI);
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {});

    connection.isConnected = db.connections[0].readyState;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

export default dbConnect;
