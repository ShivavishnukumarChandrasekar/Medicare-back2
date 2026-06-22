import { Request } from 'express';

export type Role = "patient" | "doctor" | "reception" | "admin";

export interface IUser {
    _id?: string;
    email: string;
    password: string;
    role: Role;
    name: string;
    permissions: string[];
    status: "active" | "suspended" | "deactivated";
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPatient {
    _id?: string;
    userId: string;
    patientId: string;
    name: string;
    email: string;
    phone: string;
    dob: Date;
    bloodGroup: string;
    address: string;
    imageUrl?: string;
    qrCodeUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IDoctor {
    _id?: string;
    userId: string;
    name: string;
    specialty: string;
    experience: string;
    rating: number;
    imageUrl: string;
    availableSlots: string[];
    status: "online" | "offline";
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IAppointment {
    _id?: string;
    appointmentId: string;
    doctorId: string;
    patientId: string;
    date: Date;
    slot: string;
    token?: string;
    status: "upcoming" | "completed" | "cancelled" | "settled";
    diagnosis?: {
        notes: string;
        medicines: string;
    };
    labTests?: Array<{
        testName: string;
        status: "requested" | "completed";
        date: Date;
    }>;
    vitals?: {
        bp: string;
        pulse: string;
        temp: string;
    };
    pendingChange?: {
        type: "cancel" | "reschedule";
        newDate?: Date;
        newSlot?: string;
        reason?: string;
        requestDate: Date;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IMedicalRecord {
    _id?: string;
    recordId: string;
    patientId: string;
    type: "Prescription" | "Lab Report" | "Scan" | "Medical Follow Up" | "Other";
    title: string;
    date: Date;
    fileUrl: string;
    details?: {
        notes?: string;
        medicines?: string;
        labTests?: string[];
        doctorName?: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IInvoice {
    _id?: string;
    invoiceId: string;
    appointmentId: string;
    patientId: string;
    items: Array<{
        description: string;
        amount: number;
    }>;
    total: number;
    status: "pending" | "paid";
    paymentMethod?: "Cash" | "Card" | "UPI" | "Insurance";
    hasInsurance?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IInventory {
    _id?: string;
    name: string;
    category: string;
    stock: number;
    minStock: number;
    unit: string;
    price: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface INotification {
    _id?: string;
    userId: string;
    message: string;
    read: boolean;
    createdAt?: Date;
}

export interface ISecurityAlert {
    _id?: string;
    userId: string;
    type: "unauthorized_login";
    message: string;
    createdAt?: Date;
}

export interface IContactRequest {
    _id?: string;
    name: string;
    email: string;
    message: string;
    status: "pending" | "resolved";
    createdAt?: Date;
    updatedAt?: Date;
}

// Request/Response types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    userId: string;
    role: Role;
    name: string;
}

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: Role;
        email: string;
    };
}
