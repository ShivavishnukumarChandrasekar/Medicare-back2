import mongoose, { Schema, Model } from 'mongoose';
import { IInvoice } from '../types';

const invoiceSchema = new Schema<IInvoice>(
    {
        invoiceId: {
            type: String,
            required: true,
            unique: true,
        },
        appointmentId: {
            type: String,
            required: true,
            ref: 'Appointment',
        },
        patientId: {
            type: String,
            required: true,
            ref: 'Patient',
        },
        items: [
            {
                description: { type: String, required: true },
                amount: { type: Number, required: true },
            },
        ],
        total: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'paid'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Card', 'UPI', 'Insurance'],
        },
        hasInsurance: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
invoiceSchema.index({ invoiceId: 1 });
invoiceSchema.index({ appointmentId: 1 });
invoiceSchema.index({ patientId: 1 });
invoiceSchema.index({ status: 1 });

export const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice', invoiceSchema);
