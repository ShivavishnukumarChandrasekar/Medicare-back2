// Mock email service for development
// In production, integrate with SendGrid, Nodemailer, or similar

interface OTPStore {
    [email: string]: {
        otp: string;
        expiresAt: number;
    };
}

const otpStore: OTPStore = {};

export const sendOTP = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with 10-minute expiration
        otpStore[email] = {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000,
        };

        // In development, log OTP to console
        console.log(`📧 OTP for ${email}: ${otp}`);

        // TODO: In production, send actual email using email service
        // await emailClient.send({
        //   to: email,
        //   subject: 'Medicare - Password Reset OTP',
        //   text: `Your OTP is: ${otp}. Valid for 10 minutes.`,
        // });

        return {
            success: true,
            message: `OTP sent to ${email} (Check console in dev mode)`,
        };
    } catch (error) {
        console.error('Error sending OTP:', error);
        return {
            success: false,
            message: 'Failed to send OTP',
        };
    }
};

export const verifyOTP = (email: string, otp: string): boolean => {
    const stored = otpStore[email];

    if (!stored) {
        return false;
    }

    if (Date.now() > stored.expiresAt) {
        delete otpStore[email];
        return false;
    }

    if (stored.otp === otp) {
        delete otpStore[email];
        return true;
    }

    return false;
};
