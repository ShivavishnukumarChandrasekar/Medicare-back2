import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '5000', 10),
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare',
    jwtSecret: (process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production') as string,
    jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
    nodeEnv: process.env.NODE_ENV || 'development',
};
