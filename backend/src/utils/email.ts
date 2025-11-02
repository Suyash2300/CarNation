/**
 * Email utility functions
 * For now, we'll just log the email content
 * Later, you can integrate with services like:
 * - Nodemailer
 * - SendGrid
 * - AWS SES
 * - Resend
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // TODO: Integrate with email service (Nodemailer, SendGrid, etc.)
  // For now, just log the email content
  console.log('📧 Email to be sent:');
  console.log('To:', options.to);
  console.log('Subject:', options.subject);
  console.log('Body:', options.text || options.html);
  console.log('---');
  
  // In production, implement actual email sending:
  // await nodemailer.sendMail({
  //   from: process.env.EMAIL_FROM,
  //   to: options.to,
  //   subject: options.subject,
  //   html: options.html,
  //   text: options.text,
  // });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  resetUrl: string
): Promise<void> => {
  const subject = 'Reset Your CarNation Password';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Reset Your Password</h2>
          <p>Hello,</p>
          <p>You requested to reset your password for your CarNation account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <div class="footer">
            <p>Best regards,<br>The CarNation Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
  const text = `
    Reset Your CarNation Password
    
    You requested to reset your password. Click the link below:
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request this, please ignore this email.
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};

