import { Response } from 'express';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { Inventory } from '../models/Inventory';
import { Doctor } from '../models/Doctor';
import { SecurityAlert } from '../models/SecurityAlert';
import { ContactRequest } from '../models/ContactRequest';
import { AuthRequest } from '../types';

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const Invoice = require('../models/Invoice').Invoice;
        const invoices = await Invoice.find();
        const appointments = await Appointment.find();
        const inventory = await Inventory.find();
        const doctors = await Doctor.find();

        const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + inv.total, 0);
        const pharmacyAlerts = inventory.filter((item) => item.stock <= item.minStock).length;

        // Group revenue by date
        const timelineMap: Record<string, number> = {};
        invoices.forEach((inv: any) => {
            const date = inv.createdAt.toISOString().split('T')[0];
            timelineMap[date] = (timelineMap[date] || 0) + inv.total;
        });
        const revenueTimeline = Object.entries(timelineMap)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const uniquePatients = new Set(appointments.map((a) => a.patientId)).size;

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                revenueGrowth: 15.4, // Mock
                totalPatients: uniquePatients,
                patientGrowth: 8.2, // Mock
                activeDoctors: doctors.length,
                pharmacyAlerts,
                revenueTimeline,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');

        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
};

export const getInventory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const inventory = await Inventory.find();
        res.status(200).json({ success: true, data: inventory });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
    }
};

export const createInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const item = await Inventory.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to create inventory item' });
    }
};

export const updateInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const item = await Inventory.findByIdAndUpdate(id, req.body, { new: true });

        if (!item) {
            res.status(404).json({ success: false, error: 'Inventory item not found' });
            return;
        }

        res.status(200).json({ success: true, data: item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to update inventory item' });
    }
};

export const deleteInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const item = await Inventory.findByIdAndDelete(id);

        if (!item) {
            res.status(404).json({ success: false, error: 'Inventory item not found' });
            return;
        }

        res.status(200).json({ success: true, data: { message: 'Item deleted' } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to delete inventory item' });
    }
};

export const adjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { delta } = req.body;

        const item = await Inventory.findById(id);
        if (!item) {
            res.status(404).json({ success: false, error: 'Inventory item not found' });
            return;
        }

        item.stock = Math.max(0, item.stock + delta);
        await item.save();

        res.status(200).json({ success: true, data: item });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to adjust stock' });
    }
};

export const getSecurityAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const alerts = await SecurityAlert.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ success: true, data: alerts });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch security alerts' });
    }
};

export const getContactRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const requests = await ContactRequest.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to fetch contact requests' });
    }
};

export const updateContactRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await ContactRequest.findByIdAndUpdate(id, { status }, { new: true });

        if (!request) {
            res.status(404).json({ success: false, error: 'Contact request not found' });
            return;
        }

        res.status(200).json({ success: true, data: request });
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to update contact request' });
    }
};
