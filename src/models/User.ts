import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['patient', 'doctor', 'reception', 'admin'],
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        permissions: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ['active', 'suspended', 'deactivated'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Create index on email for faster lookups
userSchema.index({ email: 1 });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
