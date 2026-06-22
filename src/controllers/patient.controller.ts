import { Response } from 'express';
import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { MedicalRecord } from '../models/MedicalRecord';
import { Notification } from '../models/Notification';
import { ContactRequest } from '../models/ContactRequest';
import { AuthRequest } from '../types';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const patient = await Patient.findOne({ userId });

        if (!patient) {
            res.status(404).json({ success: false, error: 'Patient profile not found' });
            return;
        }

        res.status(200).json({ success: true, data: patient });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
};

export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const patient = await Patient.findOne({ userId });

        if (!patient) {
            res.status(404).json({ success: false, error: 'Patient not found' });
            return;
        }

        const appointments = await Appointment.find({ patientId: patient._id!.toString() })
            .sort({ date: -1 });

        res.status(200).json({ success: true, data: appointments });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
    }
};

export const bookAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { doctorId, slot, date } = req.body;

        const patient = await Patient.findOne({ userId });
        if (!patient) {
            res.status(404).json({ success: false, error: 'Patient not found' });
            return;
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            res.status(404).json({ success: false, error: 'Doctor not found' });
            return;
        }

        if (doctor.status === 'offline') {
            res.status(400).json({ success: false, error: 'This specialist is currently offline and not accepting bookings.' });
            return;
        }

        const appointment = await Appointment.create({
            appointmentId: 'APT-' + Date.now(),
            doctorId: doctor._id!.toString(),
            patientId: patient._id!.toString(),
            date: new Date(date),
            slot,
            status: 'upcoming',
        });

        res.status(201).json({ success: true, data: appointment });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to book appointment' });
    }
};

export const cancelAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ success: false, error: 'Appointment not found' });
            return;
        }

        appointment.pendingChange = {
            type: 'cancel',
            reason,
            requestDate: new Date(),
        };
        await appointment.save();

        // Notify doctor
        await Notification.create({
            userId: appointment.doctorId,
            message: `Patient requested to cancel appointment. Reason: ${reason}`,
            read: false,
        });

        res.status(200).json({ success: true, data: { message: 'Cancellation request submitted' } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to cancel appointment' });
    }
};

export const rescheduleAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { newDate, newSlot, reason } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ success: false, error: 'Appointment not found' });
            return;
        }

        const doctor = await Doctor.findById(appointment.doctorId);
        if (doctor && doctor.status === 'offline') {
            res.status(400).json({ success: false, error: 'Cannot reschedule: Specialist is currently offline.' });
            return;
        }

        appointment.pendingChange = {
            type: 'reschedule',
            newDate: new Date(newDate),
            newSlot,
            reason,
            requestDate: new Date(),
        };
        await appointment.save();

        // Notify doctor
        await Notification.create({
            userId: appointment.doctorId,
            message: `Patient requested to reschedule appointment. Reason: ${reason}`,
            read: false,
        });

        res.status(200).json({ success: true, data: { message: 'Reschedule request submitted' } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to reschedule appointment' });
    }
};

export const getMedicalRecords = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const patient = await Patient.findOne({ userId });

        if (!patient) {
            res.status(404).json({ success: false, error: 'Patient not found' });
            return;
        }

        const records = await MedicalRecord.find({ patientId: patient._id!.toString() })
            .sort({ date: -1 });

        res.status(200).json({ success: true, data: records });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch medical records' });
    }
};

export const uploadMedicalRecord = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const patient = await Patient.findOne({ userId });

        if (!patient) {
            res.status(404).json({ success: false, error: 'Patient not found' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ success: false, error: 'No file uploaded' });
            return;
        }

        const record = await MedicalRecord.create({
            recordId: 'REC-' + Date.now(),
            patientId: patient._id!.toString(),
            type: 'Other',
            title: req.file.originalname,
            date: new Date(),
            fileUrl: `/uploads/${req.file.filename}`,
        });

        res.status(201).json({ success: true, data: record });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to upload medical record' });
    }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const notification = await Notification.findById(id);

        if (!notification) {
            res.status(404).json({ success: false, error: 'Notification not found' });
            return;
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({ success: true, data: notification });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
    }
};

export const getDoctors = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json({ success: true, data: doctors });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch doctors' });
    }
};

export const submitContactRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, message } = req.body;

        const contactRequest = await ContactRequest.create({
            name,
            email,
            message,
            status: 'pending',
        });

        res.status(201).json({ success: true, data: contactRequest });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to submit contact request' });
    }
};
