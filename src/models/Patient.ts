import mongoose, { Schema, Model } from 'mongoose';
import { IPatient } from '../types';

const patientSchema = new Schema<IPatient>(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User',
        },
        patientId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            default: '',
        },
        phone: {
            type: String,
            required: true,
        },
        dob: {
            type: Date,
            required: true,
        },
        bloodGroup: {
            type: String,
            default: '',
        },
        address: {
            type: String,
            default: '',
        },
        imageUrl: {
            type: String,
            default: '',
        },
        qrCodeUrl: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
patientSchema.index({ userId: 1 });
patientSchema.index({ patientId: 1 });
patientSchema.index({ name: 'text' }); // For text search

export const Patient: Model<IPatient> = mongoose.model<IPatient>('Patient', patientSchema);
