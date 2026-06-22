import mongoose, { Schema, Model } from 'mongoose';
import { IDoctor } from '../types';

const doctorSchema = new Schema<IDoctor>(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
        specialty: {
            type: String,
            required: true,
        },
        experience: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        imageUrl: {
            type: String,
            default: '',
        },
        availableSlots: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ['online', 'offline'],
            default: 'online',
        },
    },
    {
        timestamps: true,
    }
);

// Create index
doctorSchema.index({ userId: 1 });
doctorSchema.index({ specialty: 1 });

export const Doctor: Model<IDoctor> = mongoose.model<IDoctor>('Doctor', doctorSchema);
