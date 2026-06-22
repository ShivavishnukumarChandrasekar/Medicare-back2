import mongoose, { Schema, Model } from 'mongoose';
import { INotification } from '../types';

const notificationSchema = new Schema<INotification>(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User',
        },
        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

export const Notification: Model<INotification> = mongoose.model<INotification>(
    'Notification',
    notificationSchema
);
