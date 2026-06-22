import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { Inventory } from '../models/Inventory';

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seed...');

        await connectDatabase();

        // Clear existing data
        await User.deleteMany({});
        await Patient.deleteMany({});
        await Doctor.deleteMany({});
        await Inventory.deleteMany({});

        console.log('✅ Cleared existing data');

        // Create users
        const hashedPassword = await bcrypt.hash('password123', 10);

        const adminUser = await User.create({
            email: 'admin@medicare.com',
            password: hashedPassword,
            role: 'admin',
            name: 'Admin User',
            permissions: ['all'],
            status: 'active',
        });

        const doctorUser = await User.create({
            email: 'doctor@medicare.com',
            password: hashedPassword,
            role: 'doctor',
            name: 'Dr. Michael Ross',
            permissions: ['prescribe', 'view_history'],
            status: 'active',
        });

        const receptionUser = await User.create({
            email: 'reception@medicare.com',
            password: hashedPassword,
            role: 'reception',
            name: 'Priya Sharma',
            permissions: ['billing', 'registration'],
            status: 'active',
        });

        const patientUser = await User.create({
            email: 'patient@medicare.com',
            password: hashedPassword,
            role: 'patient',
            name: 'Aditya Kumar',
            permissions: ['view_records'],
            status: 'active',
        });

        // Create deactivated user for testing
        await User.create({
            email: 'deactivated@medicare.com',
            password: hashedPassword,
            role: 'patient',
            name: 'Deactivated User',
            permissions: [],
            status: 'deactivated',
        });

        console.log('✅ Created users');

        // Create doctor profile
        const doctor = await Doctor.create({
            userId: doctorUser._id!.toString(),
            name: 'Dr. Michael Ross',
            specialty: 'General Medicine',
            experience: '15 years',
            rating: 4.7,
            imageUrl: 'https://ui-avatars.com/api/?name=Michael+Ross&background=random',
            availableSlots: ['08:00 AM', '10:00 AM', '01:00 PM', '06:00 PM'],
            status: 'online',
        });

        // Create more doctors
        await Doctor.create({
            userId: 'doctor-2',
            name: 'Dr. Sarah D\'Souza',
            specialty: 'Cardiology',
            experience: '12 years',
            rating: 4.8,
            imageUrl: 'https://ui-avatars.com/api/?name=Sarah+DSouza&background=random',
            availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM'],
            status: 'online',
        });

        await Doctor.create({
            userId: 'doctor-3',
            name: 'Dr. Raj Patel',
            specialty: 'Orthopedics',
            experience: '8 years',
            rating: 4.6,
            imageUrl: 'https://ui-avatars.com/api/?name=Raj+Patel&background=random',
            availableSlots: ['11:00 AM', '03:30 PM', '05:00 PM'],
            status: 'online',
        });

        await Doctor.create({
            userId: 'doctor-4',
            name: 'Dr. Emily Chen',
            specialty: 'Dermatology',
            experience: '5 years',
            rating: 4.9,
            imageUrl: 'https://ui-avatars.com/api/?name=Emily+Chen&background=random',
            availableSlots: ['09:30 AM', '12:00 PM', '04:00 PM'],
            status: 'online',
        });

        console.log('✅ Created doctors');

        // Create patient profile
        await Patient.create({
            userId: patientUser._id!.toString(),
            patientId: 'MED-PT-2024-001',
            name: 'Aditya Kumar',
            email: 'patient@medicare.com',
            phone: '+91 98765 43210',
            dob: new Date('1990-05-15'),
            bloodGroup: 'O+',
            address: '123, Wellness Ave, Bangalore, 560001',
            imageUrl: 'https://ui-avatars.com/api/?name=Aditya+Kumar&background=0D8ABC&color=fff&size=128',
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MED-PT-2024-001',
        });

        console.log('✅ Created patient profile');

        // Create inventory items
        await Inventory.create([
            {
                name: 'Paracetamol 500mg',
                category: 'Analgesics',
                stock: 150,
                minStock: 50,
                unit: 'Tablets',
                price: 5,
            },
            {
                name: 'Amoxicillin 250mg',
                category: 'Antibiotics',
                stock: 20,
                minStock: 30,
                unit: 'Capsules',
                price: 12,
            },
            {
                name: 'Ibuprofen 400mg',
                category: 'Analgesics',
                stock: 85,
                minStock: 40,
                unit: 'Tablets',
                price: 8,
            },
            {
                name: 'Cetirizine 10mg',
                category: 'Antihistamines',
                stock: 120,
                minStock: 50,
                unit: 'Tablets',
                price: 10,
            },
            {
                name: 'Insulin Pen',
                category: 'Diabetes',
                stock: 5,
                minStock: 10,
                unit: 'Packs',
                price: 450,
            },
        ]);

        console.log('✅ Created inventory items');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Test Credentials:');
        console.log('Admin: admin@medicare.com / password123');
        console.log('Doctor: doctor@medicare.com / password123');
        console.log('Reception: reception@medicare.com / password123');
        console.log('Patient: patient@medicare.com / password123');
        console.log('Deactivated: deactivated@medicare.com / password123 (should fail)\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seedDatabase();
