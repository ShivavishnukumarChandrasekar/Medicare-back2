import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config/environment';
import { Role } from '../types';

interface JWTPayload {
    userId: string;
    role: Role;
    email: string;
}

export const generateToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, config.jwtSecret as Secret, {
        expiresIn: config.jwtExpiresIn,
    } as SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
    try {
        return jwt.verify(token, config.jwtSecret as Secret) as JWTPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};
