import nodemailer from 'nodemailer';

// For development: uses Ethereal (fake SMTP) - completely free, no setup needed
// For production: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env

let transporter: nodemailer.Transporter;

export async function createTransporter(): Promise<nodemailer.Transporter> {
  // If already created, reuse it
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;

  if (smtpHost) {
    // Production: use configured SMTP server (Gmail, SendGrid, etc.)
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(`📧 Mail: Using configured SMTP server: ${smtpHost}`);
    return transporter;
  }

  // Development: create a test Ethereal account automatically
  console.log('📧 Mail: No SMTP configured, creating Ethereal test account...');
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log(`📧 Mail: Ethereal test account created: ${testAccount.user}`);
  console.log(`   Preview URL: https://ethereal.email`);
  return transporter;
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  userName?: string
): Promise<{ previewUrl?: string }> {
  const transport = await createTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const name = userName || 'there';

  const mailOptions = {
    from: `"BOLDVAN" <${process.env.SMTP_USER || 'noreply@boldvan.com'}>`,
    to,
    subject: 'Reset Your BOLDVAN Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #2dd4bf; margin: 0; font-size: 24px;">BOLD<span style="color: #ffffff;">VAN</span></h1>
          <p style="color: #94a3b8; margin-top: 8px;">Smart Tech, Clean Power</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Password Reset Request</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #475569; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background: linear-gradient(135deg, #0d9488, #14b8a6);
                      color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none;
                      font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            Or copy and paste this link in your browser:
          </p>
          <p style="background: #f1f5f9; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #334155;">
            ${resetUrl}
          </p>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
            This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  const info = await transport.sendMail(mailOptions);

  // For Ethereal: return the preview URL so we can see the email
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 Preview URL: ${previewUrl}`);
  }

  return { previewUrl: previewUrl || undefined };
}
