import mongoose, { Schema, Model } from 'mongoose';
import { IMedicalRecord } from '../types';

const medicalRecordSchema = new Schema<IMedicalRecord>(
    {
        recordId: {
            type: String,
            required: true,
            unique: true,
        },
        patientId: {
            type: String,
            required: true,
            ref: 'Patient',
        },
        type: {
            type: String,
            enum: ['Prescription', 'Lab Report', 'Scan', 'Medical Follow Up', 'Other'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        details: {
            notes: { type: String, default: '' },
            medicines: { type: String, default: '' },
            labTests: { type: [String], default: [] },
            doctorName: { type: String, default: '' },
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
medicalRecordSchema.index({ recordId: 1 });
medicalRecordSchema.index({ patientId: 1, date: -1 });
medicalRecordSchema.index({ type: 1 });

export const MedicalRecord: Model<IMedicalRecord> = mongoose.model<IMedicalRecord>(
    'MedicalRecord',
    medicalRecordSchema
);
