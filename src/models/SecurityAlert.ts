import mongoose, { Schema, Model } from 'mongoose';
import { ISecurityAlert } from '../types';

const securityAlertSchema = new Schema<ISecurityAlert>(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            enum: ['unauthorized_login'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
securityAlertSchema.index({ userId: 1, createdAt: -1 });
securityAlertSchema.index({ type: 1 });

export const SecurityAlert: Model<ISecurityAlert> = mongoose.model<ISecurityAlert>(
    'SecurityAlert',
    securityAlertSchema
);
