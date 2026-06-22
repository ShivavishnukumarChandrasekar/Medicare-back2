import { Response } from 'express';
import { Appointment } from '../models/Appointment';
import { Patient } from '../models/Patient';
import { MedicalRecord } from '../models/MedicalRecord';
import { Notification } from '../models/Notification';
import { Inventory } from '../models/Inventory';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';
import { AuthRequest } from '../types';

export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const doctor = await Doctor.findOne({ userId });

        if (!doctor) {
            res.status(404).json({ success: false, error: 'Doctor not found' });
            return;
        }

        const appointments = await Appointment.find({
            doctorId: doctor._id!.toString(),
            status: 'upcoming',
        }).sort({ date: 1, slot: 1 });

        res.status(200).json({ success: true, data: appointments });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
    }
};

export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            res.status(404).json({ success: false, error: 'Appointment not found' });
            return;
        }

        res.status(200).json({ success: true, data: appointment });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch appointment' });
    }
};

export const updateConsultation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { diagnosis, labTests } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ success: false, error: 'Appointment not found' });
            return;
        }

        // Update appointment with diagnosis
        appointment.diagnosis = diagnosis;
        if (labTests && labTests.length > 0) {
            appointment.labTests = labTests.map((test: string) => ({
                testName: test,
                status: 'requested',
                date: new Date(),
            }));
        }
        appointment.status = 'completed';
        await appointment.save();

        // Adjust inventory stock for medicines
        if (diagnosis.medicines) {
            try {
                const meds = JSON.parse(diagnosis.medicines);
                if (Array.isArray(meds)) {
                    for (const med of meds) {
                        const invItem = await Inventory.findOne({ name: med.name });
                        if (invItem) {
                            invItem.stock = Math.max(0, invItem.stock - (med.qty || 1));
                            await invItem.save();
                        }
                    }
                }
            } catch (e) {
                console.error('Error adjusting inventory:', e);
            }
        }

        // Create medical record
        let medDisplay = diagnosis.medicines;
        try {
            const meds = JSON.parse(diagnosis.medicines);
            if (Array.isArray(meds)) {
                medDisplay = meds.map((m: any) => `${m.name} (${m.dosage} - ${m.time}) x ${m.qty}`).join(', ');
            }
        } catch (e) { }

        const doctor = await Doctor.findById(appointment.doctorId);
        await MedicalRecord.create({
            recordId: 'REC-' + Date.now(),
            patientId: appointment.patientId,
            type: 'Medical Follow Up',
            title: `Consultation Report - Dr. ${doctor?.name || 'Unknown'}`,
            date: new Date(),
            fileUrl: '#',
            details: {
                notes: diagnosis.notes,
                medicines: medDisplay,
                labTests,
                doctorName: doctor?.name || 'Unknown',
            },
        });

        res.status(200).json({ success: true, data: appointment });
    } catch (error: any) {
        console.error('Update consultation error:', error);
        res.status(500).json({ success: false, error: 'Failed to update consultation' });
    }
};

export const approveAppointmentChange = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment || !appointment.pendingChange) {
            res.status(404).json({ success: false, error: 'No pending change found' });
            return;
        }

        const change = appointment.pendingChange;

        if (change.type === 'cancel') {
            appointment.status = 'cancelled';
            await Notification.create({
                userId: appointment.patientId,
                message: `Your request to cancel appointment was Approved.`,
                read: false,
            });
        } else if (change.type === 'reschedule' && change.newDate && change.newSlot) {
            appointment.date = change.newDate;
            appointment.slot = change.newSlot;
            appointment.status = 'upcoming';
            await Notification.create({
                userId: appointment.patientId,
                message: `Your request to reschedule appointment was Approved.`,
                read: false,
            });
        }

        appointment.pendingChange = undefined;
        await appointment.save();

        res.status(200).json({ success: true, data: appointment });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to approve change' });
    }
};

export const denyAppointmentChange = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment || !appointment.pendingChange) {
            res.status(404).json({ success: false, error: 'No pending change found' });
            return;
        }

        await Notification.create({
            userId: appointment.patientId,
            message: `Your request to ${appointment.pendingChange.type} appointment was Denied.`,
            read: false,
        });

        appointment.pendingChange = undefined;
        await appointment.save();

        res.status(200).json({ success: true, data: appointment });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to deny change' });
    }
};

export const searchPatients = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { query } = req.query;

        if (!query) {
            res.status(400).json({ success: false, error: 'Search query is required' });
            return;
        }

        const patients = await Patient.find({
            $or: [
                { name: { $regex: query as string, $options: 'i' } },
                { patientId: { $regex: query as string, $options: 'i' } },
            ],
        }).limit(20);

        res.status(200).json({ success: true, data: patients });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to search patients' });
    }
};

export const getPatientHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const records = await MedicalRecord.find({ patientId: id }).sort({ date: -1 });

        res.status(200).json({ success: true, data: records });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch patient history' });
    }
};

export const updatePatientName = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const patient = await Patient.findById(id);
        if (!patient) {
            res.status(404).json({ success: false, error: 'Patient not found' });
            return;
        }

        patient.name = name;
        await patient.save();

        // Update user record
        await User.findByIdAndUpdate(patient.userId, { name });

        // Update appointments
        await Appointment.updateMany({ patientId: id }, { $set: { 'patientName': name } });

        res.status(200).json({ success: true, data: patient });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to update patient name' });
    }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const doctor = await Doctor.findOne({ userId });

        if (!doctor) {
            res.status(404).json({ success: false, error: 'Doctor not found' });
            return;
        }

        const notifications = await Notification.find({ userId: doctor._id!.toString() }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
};

export const updateDoctorStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { status } = req.body;

        const doctor = await Doctor.findOne({ userId });
        if (!doctor) {
            res.status(404).json({ success: false, error: 'Doctor not found' });
            return;
        }

        doctor.status = status;
        await doctor.save();

        res.status(200).json({ success: true, data: doctor });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to update status' });
    }
};

export const updateDoctorSlots = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { slots } = req.body;

        const doctor = await Doctor.findOne({ userId });
        if (!doctor) {
            res.status(404).json({ success: false, error: 'Doctor not found' });
            return;
        }

        doctor.availableSlots = slots;
        await doctor.save();

        res.status(200).json({ success: true, data: doctor });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to update slots' });
    }
};
