import * as brevo from '@getbrevo/brevo';
import nodemailer from 'nodemailer';

const brevoApiKey = process.env.BREVO_API_KEY;
const useSMTP = process.env.BREVO_USE_SMTP === 'true' || !!process.env.BREVO_SMTP_PASSWORD;

const smtpConfig = {
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
};

let apiInstance: brevo.TransactionalEmailsApi | null = null;
if (brevoApiKey && !useSMTP) {
  apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(0 as any, brevoApiKey);
}

const createSMTPTransporter = () => {
  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    return null;
  }
  return nodemailer.createTransport(smtpConfig);
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
): Promise<void> => {
  const fromEmailRaw = process.env.BREVO_FROM_EMAIL || process.env.BREVO_FROM || 'CarNation <carnation71212@gmail.com>';
  let fromName = process.env.BREVO_FROM_NAME || 'CarNation';
  let fromAddress = 'carnation71212@gmail.com';
  
  if (fromEmailRaw.includes('<')) {
    const match = fromEmailRaw.match(/(.+?)\s*<(.+?)>/);
    if (match) {
      fromName = match[1].trim() || fromName;
      fromAddress = match[2].trim();
    } else {
      fromAddress = fromEmailRaw.replace(/[<>]/g, '').trim();
    }
  } else {
    fromAddress = fromEmailRaw.trim();
  }
  
  const subject = 'Reset Your CarNation Password';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          h2 {
            color: #1e293b;
            margin-bottom: 20px;
          }
          p {
            color: #475569;
            margin-bottom: 16px;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 24px 0;
            text-align: center;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .link-text {
            background-color: #f1f5f9;
            padding: 12px;
            border-radius: 6px;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            color: #475569;
            margin: 16px 0;
          }
          .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CarNation</div>
          </div>
          
          <h2>Reset Your Password</h2>
          
          <p>Hello,</p>
          
          <p>You requested to reset your password for your CarNation account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          
          <div class="link-text">
            ${resetUrl}
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in <strong>1 hour</strong>. If you didn't request this password reset, please ignore this email.
          </div>
          
          <div class="footer">
            <p>Best regards,<br><strong>The CarNation Team</strong></p>
            <p>© 2024 CarNation. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Reset Your CarNation Password

Hello,

You requested to reset your password for your CarNation account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The CarNation Team
  `.trim();

  if (useSMTP) {
    const transporter = createSMTPTransporter();
    if (!transporter) {
      throw new Error(
        'Brevo SMTP credentials not configured. Please set:\n' +
        '  BREVO_SMTP_USER=your-email@brevo.com\n' +
        '  BREVO_SMTP_PASSWORD=your-smtp-password\n' +
        '\nGet SMTP password from: https://app.brevo.com/settings/keys/smtp'
      );
    }

    try {
      const info = await transporter.sendMail({
        from: `${fromName} <${fromAddress}>`,
        to: email,
        subject: subject,
        html: html,
        text: text,
      });

      console.log(`Password reset email sent to ${email}`);
      return;
    } catch (error: any) {
      console.error('Failed to send email via SMTP:', error.message || error);
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
  }

  if (!apiInstance || !brevoApiKey) {
    throw new Error(
      'Brevo API key is not configured. Please set BREVO_API_KEY in your .env file.\n' +
      'Or set BREVO_SMTP_USER and BREVO_SMTP_PASSWORD to use SMTP.\n' +
      'Get credentials at: https://app.brevo.com/settings/keys/api'
    );
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.textContent = text;
    sendSmtpEmail.sender = { name: fromName, email: fromAddress };
    sendSmtpEmail.to = [{ email: email }];

    await apiInstance!.sendTransacEmail(sendSmtpEmail);
    console.log(`Password reset email sent to ${email}`);
  } catch (error: any) {
    console.error('Failed to send email via API:', error.message || error);
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
  }
};
