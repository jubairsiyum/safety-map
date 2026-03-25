import mongoose from 'mongoose';
import { ServerApiVersion } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI?.trim();
const MONGODB_FALLBACK_URI = process.env.MONGODB_FALLBACK_URI?.trim();

const REQUIRED_MONGODB_URI: string = (() => {
  if (!MONGODB_URI) {
    throw new Error(
      'Missing MONGODB_URI in .env.local. Add a valid MongoDB connection string and restart the server.'
    );
  }

  return MONGODB_URI;
})();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  activeUri: string | null;
}

const globalWithMongoose = global as typeof globalThis & {
  mongoose: MongooseCache;
};

const cached: MongooseCache =
  globalWithMongoose.mongoose || { conn: null, promise: null, activeUri: null };

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 12000,
      connectTimeoutMS: 12000,
      socketTimeoutMS: 20000,
      family: 4,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    };

    cached.promise = (async () => {
      try {
        const conn = await mongoose.connect(REQUIRED_MONGODB_URI, opts);
        cached.activeUri = REQUIRED_MONGODB_URI;
        return conn;
      } catch (primaryError) {
        const message = primaryError instanceof Error ? primaryError.message : String(primaryError);
        const shouldTryFallback =
          Boolean(MONGODB_FALLBACK_URI) &&
          (message.includes('tlsv1 alert internal error') ||
            message.includes('SSL routines:ssl3_read_bytes') ||
            message.includes('Server selection timed out'));

        if (!shouldTryFallback || !MONGODB_FALLBACK_URI) {
          throw primaryError;
        }

        try {
          const conn = await mongoose.connect(MONGODB_FALLBACK_URI, opts);
          cached.activeUri = MONGODB_FALLBACK_URI;
          console.warn('Primary MongoDB URI failed; connected using MONGODB_FALLBACK_URI.');
          return conn;
        } catch {
          throw primaryError;
        }
      }
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function getActiveMongoUri() {
  return cached.activeUri;
}

export default dbConnect;
