import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateSecret, generateURI, verifySync } from 'otplib';

// ------ Password ---------

/**
 * Hashes a password using bcrypt.
 *
 * @param {string} password - Plain text password.
 *
 * @returns {Promise<string>} Hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => bcrypt.hash(password, 12);

// Constante dummy para igualar tiempo de verificación cuando no existe usuario
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync('__DUMMY_PASSWORD__', 12);

/**
 * Verifies a password against a bcrypt hash.
 *
 * @param {string} password - Plain text password.
 * @param {string} hash - Bcrypt hash to compare against.
 *
 * @returns {Promise<boolean>} True if the password matches the hash.
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> =>
    bcrypt.compare(password, hash);

// ------ JWT ----------

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('Missing JWT secret(s) – add JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to .env');
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

/**
 * Signs a JWT access token.
 *
 * @param {object} payload - Payload to embed in the token.
 *
 * @returns {string} Signed JWT access token.
 */
export const signAccessToken = (payload: object): string =>
    jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'],
    });

/**
 * Signs a JWT refresh token.
 *
 * @param {object} payload - Payload to embed in the token.
 *
 * @returns {string} Signed JWT refresh token.
 */
export const signRefreshToken = (payload: object): string =>
    jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
    });

/**
 * Verifies a JWT access token.
 *
 * @param {string} token - JWT access token to verify.
 *
 * @returns {any} Decoded token payload.
 */
export const verifyAccessToken = (token: string): any => jwt.verify(token, ACCESS_SECRET);

/**
 * Verifies a JWT refresh token.
 *
 * @param {string} token - JWT refresh token to verify.
 *
 * @returns {any} Decoded token payload.
 */
export const verifyRefreshToken = (token: string): any => jwt.verify(token, REFRESH_SECRET);

// ------- OTP --------
/**
 * Generates a secret for OTP generation.
 *
 * @returns {string} OTP secret.
 */
export const generateOtpSecret = (): string => generateSecret();

/**
 * Generates a QR code URI for OTP provisioning.
 *
 * @param {string} email - User email address.
 * @param {string} secret - OTP secret.
 *
 * @returns {string} QR code URI.
 */
export const getOtpQrUri = (email: string, secret: string): string =>
    generateURI({ issuer: 'MyApp', label: email, secret });

/**
 * Verifies an OTP token against a secret.
 *
 * @param {string} token - OTP token to verify.
 * @param {string} secret - OTP secret used for verification.
 *
 * @returns {boolean} True if the OTP token is valid.
 */
export const verifyOtp = (token: string, secret: string): boolean => {
    const result = verifySync({ token, secret });
    return result.valid;
};
