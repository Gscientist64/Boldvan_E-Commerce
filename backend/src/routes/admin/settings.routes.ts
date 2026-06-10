import express from 'express';
import { prisma } from '../../utils/database';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';
import nodemailer from 'nodemailer';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeAdmin);

// ============ MARKETPLACE SETTINGS ============

// Get all settings
router.get('/', async (req, res) => {
  try {
    let settings = await prisma.marketplaceSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.marketplaceSettings.create({
        data: {
          siteName: 'Oneclick Resources',
          siteDescription: 'Your trusted solar energy marketplace',
          currency: 'NGN',
          currencySymbol: '₦',
          currencyPosition: 'before',
          taxEnabled: true,
          taxRate: 7.5,
          taxIncluded: false,
          freeShippingThreshold: 50000,
          defaultShippingFee: 2500,
          autoConfirmOrders: false,
          orderPrefix: 'ORD',
          invoicePrefix: 'INV',
          metaTitle: 'Oneclick Resources - Nigeria\'s Premier Solar Marketplace',
          metaDescription: 'Shop premium solar panels, inverters, batteries and accessories in Nigeria',
          maintenanceMode: false,
          maintenanceMessage: 'We are currently undergoing maintenance. Please check back soon.',
          maxLoginAttempts: 5,
          lockoutTime: 15,
          twoFactorAuth: false
        }
      });
    }
    
    // Remove sensitive data
    const { paystackSecretKey, flutterwaveSecretKey, smtpPassword, ...safeSettings } = settings;
    
    res.json(safeSettings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    const settingsData = req.body;
    
    let settings = await prisma.marketplaceSettings.findFirst();
    
    if (settings) {
      settings = await prisma.marketplaceSettings.update({
        where: { id: settings.id },
        data: settingsData
      });
    } else {
      settings = await prisma.marketplaceSettings.create({
        data: settingsData
      });
    }
    
    // Remove sensitive data from response
    const { paystackSecretKey, flutterwaveSecretKey, smtpPassword, ...safeSettings } = settings;
    
    res.json(safeSettings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ PAYMENT SETTINGS ============

// Get payment settings (with sensitive data masked)
router.get('/payment', async (req, res) => {
  try {
    let settings = await prisma.marketplaceSettings.findFirst();
    
    if (!settings) {
      return res.json({
        paystackPublicKey: '',
        paystackSecretKey: '',
        flutterwavePublicKey: '',
        flutterwaveSecretKey: '',
        bankTransferEnabled: true,
        bankAccountName: '',
        bankAccountNumber: '',
        bankName: ''
      });
    }
    
    // Return with masked secret keys (show only last 4 characters)
    res.json({
      paystackPublicKey: settings.paystackPublicKey || '',
      paystackSecretKey: settings.paystackSecretKey ? `••••••${settings.paystackSecretKey.slice(-4)}` : '',
      flutterwavePublicKey: settings.flutterwavePublicKey || '',
      flutterwaveSecretKey: settings.flutterwaveSecretKey ? `••••••${settings.flutterwaveSecretKey.slice(-4)}` : '',
      bankTransferEnabled: settings.bankTransferEnabled,
      bankAccountName: settings.bankAccountName || '',
      bankAccountNumber: settings.bankAccountNumber || '',
      bankName: settings.bankName || ''
    });
  } catch (error) {
    console.error('Get payment settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment settings
router.put('/payment', async (req, res) => {
  try {
    const {
      paystackPublicKey,
      paystackSecretKey,
      flutterwavePublicKey,
      flutterwaveSecretKey,
      bankTransferEnabled,
      bankAccountName,
      bankAccountNumber,
      bankName
    } = req.body;
    
    let settings = await prisma.marketplaceSettings.findFirst();
    
    const updateData: any = {
      paystackPublicKey,
      flutterwavePublicKey,
      bankTransferEnabled,
      bankAccountName,
      bankAccountNumber,
      bankName
    };
    
    // Only update secret keys if they are provided and not masked
    if (paystackSecretKey && !paystackSecretKey.includes('••••••')) {
      updateData.paystackSecretKey = paystackSecretKey;
    }
    
    if (flutterwaveSecretKey && !flutterwaveSecretKey.includes('••••••')) {
      updateData.flutterwaveSecretKey = flutterwaveSecretKey;
    }
    
    if (settings) {
      settings = await prisma.marketplaceSettings.update({
        where: { id: settings.id },
        data: updateData
      });
    } else {
      settings = await prisma.marketplaceSettings.create({
        data: updateData
      });
    }
    
    res.json({ message: 'Payment settings updated successfully' });
  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ EMAIL SETTINGS ============

// Get email settings (with sensitive data masked)
router.get('/email', async (req, res) => {
  try {
    let settings = await prisma.marketplaceSettings.findFirst();
    
    if (!settings) {
      return res.json({
        smtpHost: '',
        smtpPort: '',
        smtpUser: '',
        smtpPassword: '',
        smtpFromEmail: '',
        smtpFromName: ''
      });
    }
    
    res.json({
      smtpHost: settings.smtpHost || '',
      smtpPort: settings.smtpPort || '',
      smtpUser: settings.smtpUser || '',
      smtpPassword: settings.smtpPassword ? '••••••' : '',
      smtpFromEmail: settings.smtpFromEmail || '',
      smtpFromName: settings.smtpFromName || ''
    });
  } catch (error) {
    console.error('Get email settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update email settings
router.put('/email', async (req, res) => {
  try {
    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpFromEmail,
      smtpFromName
    } = req.body;
    
    let settings = await prisma.marketplaceSettings.findFirst();
    
    const updateData: any = {
      smtpHost,
      smtpPort: smtpPort ? parseInt(smtpPort) : null,
      smtpUser,
      smtpFromEmail,
      smtpFromName
    };
    
    // Only update password if provided and not masked
    if (smtpPassword && smtpPassword !== '••••••') {
      updateData.smtpPassword = smtpPassword;
    }
    
    if (settings) {
      settings = await prisma.marketplaceSettings.update({
        where: { id: settings.id },
        data: updateData
      });
    } else {
      settings = await prisma.marketplaceSettings.create({
        data: updateData
      });
    }
    
    res.json({ message: 'Email settings updated successfully' });
  } catch (error) {
    console.error('Update email settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test email configuration
router.post('/email/test', async (req, res) => {
  try {
    const settings = await prisma.marketplaceSettings.findFirst();
    
    if (!settings || !settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
      return res.status(400).json({ message: 'Email settings not configured' });
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword
      }
    });
    
    // Send test email
    await transporter.sendMail({
      from: `"${settings.smtpFromName || 'Oneclick Resources'}" <${settings.smtpFromEmail || settings.smtpUser}>`,
      to: req.user?.email, // Send to current admin
      subject: 'Oneclick Resources - Test Email',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your Oneclick Resources marketplace.</p>
        <p>If you're reading this, your email configuration is working correctly!</p>
        <hr>
        <p><strong>SMTP Host:</strong> ${settings.smtpHost}</p>
        <p><strong>SMTP Port:</strong> ${settings.smtpPort}</p>
        <p><strong>From:</strong> ${settings.smtpFromName || 'Oneclick Resources'}</p>
        <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
      `
    });
    
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: 'Failed to send test email: ' + (error as Error).message });
  }
});

// ============ CACHE MANAGEMENT ============

// Clear cache
router.post('/cache/clear', async (req, res) => {
  try {
    // In a real app, you would clear Redis cache here
    // For now, just log and return success
    
    console.log('Cache cleared by admin:', req.user?.email);
    
    res.json({ 
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ USER STATS ============

// Get user statistics
router.get('/users/stats', async (req, res) => {
  try {
    const [totalUsers, adminCount, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1)) // First day of current month
          }
        }
      })
    ]);
    
    const [totalOrders, totalReviews] = await Promise.all([
      prisma.order.count(),
      prisma.review.count()
    ]);
    
    res.json({
      totalUsers,
      adminCount,
      newUsersThisMonth,
      totalOrders,
      totalReviews
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;