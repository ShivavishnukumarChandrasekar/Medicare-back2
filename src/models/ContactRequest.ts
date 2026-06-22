import mongoose, { Schema, Model } from 'mongoose';
import { IContactRequest } from '../types';

const contactRequestSchema = new Schema<IContactRequest>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'resolved'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
contactRequestSchema.index({ status: 1, createdAt: -1 });
contactRequestSchema.index({ email: 1 });

export const ContactRequest: Model<IContactRequest> = mongoose.model<IContactRequest>(
    'ContactRequest',
    contactRequestSchema
);
