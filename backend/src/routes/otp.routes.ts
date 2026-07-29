import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/database';
import { sendOtpEmail } from '../utils/mail';

const router = express.Router();

// Generate a 6-digit OTP
function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Send OTP for email verification
router.post('/send', [
  body('email').isEmail().normalizeEmail(),
  body('type').isIn(['REGISTRATION', 'RESET_PASSWORD'])
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, type } = req.body;
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any previous unused OTPs for this email+type
    await prisma.otpVerification.updateMany({
      where: { email, type, usedAt: null, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() } // Expire them
    });

    // Create new OTP
    await prisma.otpVerification.create({
      data: { email, otp, type, expiresAt }
    });

    // Send OTP via email
    const userName = type === 'REGISTRATION' ? undefined : undefined;
    const { previewUrl } = await sendOtpEmail(email, otp, type);

    console.log(`🔑 OTP sent to ${email} (type: ${type})`);

    // Always mask the OTP in response for security
    res.json({
      message: 'OTP sent successfully',
      previewUrl: previewUrl || undefined
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isString(),
  body('type').isIn(['REGISTRATION', 'RESET_PASSWORD'])
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, type } = req.body;

    // Find the OTP record
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email,
        otp,
        type,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() }
    });

    // If this is a registration OTP, mark the user's email as verified
    if (type === 'REGISTRATION') {
      await prisma.user.updateMany({
        where: { email },
        data: { emailVerified: true }
      });
    }

    console.log(`✅ OTP verified for ${email} (type: ${type})`);

    res.json({
      message: 'OTP verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

export default router;
