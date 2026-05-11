import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  try {
    if (!MONGODB_URI || !MONGODB_DB_NAME) {
      console.warn('MongoDB environment variables not found. Running without database.');
      return null;
    }

    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI, {
        dbName: MONGODB_DB_NAME,
        bufferCommands: false,
      });
    }

    cached.conn = await cached.promise;

    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return null;
  }
}