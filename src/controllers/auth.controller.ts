import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { SecurityAlert } from '../models/SecurityAlert';
import { generateToken } from '../utils/jwt.util';
import { sendOTP, verifyOTP } from '../services/email.service';
import { LoginRequest, LoginResponse } from '../types';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password }: LoginRequest = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
            return;
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }

        // Check if user is deactivated
        if (user.status === 'deactivated') {
            // Log security alert
            await SecurityAlert.create({
                userId: user._id,
                type: 'unauthorized_login',
                message: `Deactivated user ${user.name} (${user.email}) attempted to access the portal.`,
            });

            res.status(403).json({
                success: false,
                error: 'Your Access has been Terminate from Login In . Kindly Contact the Admin Department',
            });
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials',
            });
            return;
        }

        // Get userId based on role
        let userId = user._id!.toString();

        // For doctors, get the doctor document ID
        if (user.role === 'doctor') {
            const doctor = await Doctor.findOne({ userId: user._id!.toString() });
            if (doctor) {
                userId = doctor._id!.toString();
            }
        }

        // Generate JWT token
        const token = generateToken({
            userId: user._id!.toString(),
            role: user.role,
            email: user.email,
        });

        const response: LoginResponse = {
            token,
            userId,
            role: user.role,
            name: user.name,
        };

        res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
        });
    }
};

export const sendOTPForReset = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({
                success: false,
                error: 'Email is required',
            });
            return;
        }

        // Check if user exists (but don't reveal if they don't for security)
        const user = await User.findOne({ email });

        // Send OTP (even if user doesn't exist, for security)
        const result = await sendOTP(email);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send OTP',
        });
    }
};

export const verifyOTPCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            res.status(400).json({
                success: false,
                error: 'Email and OTP are required',
            });
            return;
        }

        const isValid = verifyOTP(email, otp);

        if (!isValid) {
            res.status(400).json({
                success: false,
                error: 'Invalid or expired OTP',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { verified: true },
        });
    } catch (error: any) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify OTP',
        });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            res.status(400).json({
                success: false,
                error: 'Email and new password are required',
            });
            return;
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            data: { message: 'Password reset successfully' },
        });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset password',
        });
    }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as any;
        const userId = authReq.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
            return;
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error: any) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user info',
        });
    }
};
