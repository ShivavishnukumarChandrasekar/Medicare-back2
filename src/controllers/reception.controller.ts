import { Response } from 'express';
import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { Inventory } from '../models/Inventory';
import { AuthRequest } from '../types';

const PRICING = {
    CONSULTATION: 500,
    MEDICINE_BASE: 100,
    LAB_TEST_BASE: 350,
};

export const registerWalkIn = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, phone, gender, age, vitals } = req.body;

        // Check doctor availability
        const doctor = await Doctor.findOne({ _id: 'd4' }); // Default doctor for walk-ins
        if (doctor && doctor.status === 'offline') {
            res.status(400).json({ success: false, error: 'Doctor is currently offline and cannot accept walk-ins.' });
            return;
        }

        const patientId = 'MED-WALK-' + Date.now().toString().slice(-6);
        const token = 'T-' + Math.floor(100 + Math.random() * 900);

        // Create patient profile
        const patient = await Patient.create({
            userId: 'walk-in-' + Date.now(),
            patientId,
            name,
            email: '',
            phone,
            dob: new Date(new Date().getFullYear() - parseInt(age), 0, 1),
            bloodGroup: '',
            address: '',
            imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        });

        // Create appointment
        const appointment = await Appointment.create({
            appointmentId: 'APT-WALK-' + Date.now(),
            doctorId: doctor?._id!.toString() || 'd4',
            patientId: patient._id!.toString(),
            date: new Date(),
            slot: 'Walk-in',
            token,
            status: 'upcoming',
            vitals,
        });

        res.status(201).json({
            success: true,
            data: { patientId, token, appointment },
        });
    } catch (error: any) {
        console.error('Walk-in registration error:', error);
        res.status(500).json({ success: false, error: 'Failed to register walk-in patient' });
    }
};

export const getQueue = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await Appointment.find({
            date: { $gte: today, $lt: tomorrow },
            status: { $ne: 'cancelled' },
        }).sort({ slot: 1 });

        res.status(200).json({ success: true, data: appointments });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch queue' });
    }
};

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await Appointment.find({
            date: { $gte: today, $lt: tomorrow },
            status: { $ne: 'cancelled' },
        });

        const waiting = appointments.filter((a) => a.status === 'upcoming').length;

        // Get today's collections from invoices
        const Invoice = require('../models/Invoice').Invoice;
        const invoices = await Invoice.find({
            createdAt: { $gte: today, $lt: tomorrow },
            status: 'paid',
        });

        const collections = invoices.reduce((sum: number, inv: any) => sum + inv.total, 0);

        res.status(200).json({
            success: true,
            data: {
                patientsToday: appointments.length,
                waiting,
                collections,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
};

export const generateInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { appointmentId } = req.params;
        const appointment = await Appointment.findOne({ appointmentId });

        if (!appointment) {
            res.status(404).json({ success: false, error: 'Appointment not found' });
            return;
        }

        const items: any[] = [{ description: 'Consultation Fee', amount: PRICING.CONSULTATION }];

        // Add medicines
        if (appointment.diagnosis?.medicines) {
            try {
                const meds = JSON.parse(appointment.diagnosis.medicines);
                if (Array.isArray(meds)) {
                    const inventory = await Inventory.find();
                    for (const med of meds) {
                        const invItem = inventory.find((i) => i.name === med.name);
                        const unitPrice = invItem ? invItem.price : PRICING.MEDICINE_BASE;
                        const lineTotal = unitPrice * (med.qty || 1);
                        items.push({
                            description: `Medicine: ${med.name} (Qty: ${med.qty})`,
                            amount: lineTotal,
                        });
                    }
                }
            } catch (e) {
                console.error('Error parsing medicines:', e);
            }
        }

        // Add lab tests
        if (appointment.labTests) {
            for (const test of appointment.labTests) {
                items.push({
                    description: `Lab Test: ${test.testName}`,
                    amount: PRICING.LAB_TEST_BASE,
                });
            }
        }

        const total = items.reduce((sum, item) => sum + item.amount, 0);

        const invoice = {
            invoiceId: 'INV-' + Date.now().toString().slice(-6),
            appointmentId: appointment._id!.toString(),
            patientId: appointment.patientId,
            items,
            total,
            status: 'pending',
        };

        res.status(200).json({ success: true, data: invoice });
    } catch (error: any) {
        console.error('Generate invoice error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate invoice' });
    }
};

export const saveInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const invoiceData = req.body;

        const Invoice = require('../models/Invoice').Invoice;
        const invoice = await Invoice.create({
            ...invoiceData,
            status: 'paid',
        });

        // Update appointment status to settled
        await Appointment.findByIdAndUpdate(invoiceData.appointmentId, { status: 'settled' });

        res.status(201).json({ success: true, data: invoice });
    } catch (error: any) {
        console.error('Save invoice error:', error);
        res.status(500).json({ success: false, error: 'Failed to save invoice' });
    }
};
