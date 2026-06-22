import mongoose, { Schema, Model } from 'mongoose';
import { IAppointment } from '../types';

const appointmentSchema = new Schema<IAppointment>(
    {
        appointmentId: {
            type: String,
            required: true,
            unique: true,
        },
        doctorId: {
            type: String,
            required: true,
            ref: 'Doctor',
        },
        patientId: {
            type: String,
            required: true,
            ref: 'Patient',
        },
        date: {
            type: Date,
            required: true,
        },
        slot: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['upcoming', 'completed', 'cancelled', 'settled'],
            default: 'upcoming',
        },
        diagnosis: {
            notes: { type: String, default: '' },
            medicines: { type: String, default: '' },
        },
        labTests: [
            {
                testName: { type: String, required: true },
                status: {
                    type: String,
                    enum: ['requested', 'completed'],
                    default: 'requested',
                },
                date: { type: Date, default: Date.now },
            },
        ],
        vitals: {
            bp: { type: String, default: '' },
            pulse: { type: String, default: '' },
            temp: { type: String, default: '' },
        },
        pendingChange: {
            type: {
                type: String,
                enum: ['cancel', 'reschedule'],
            },
            newDate: { type: Date },
            newSlot: { type: String },
            reason: { type: String },
            requestDate: { type: Date },
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
appointmentSchema.index({ appointmentId: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ status: 1 });

export const Appointment: Model<IAppointment> = mongoose.model<IAppointment>(
    'Appointment',
    appointmentSchema
);
