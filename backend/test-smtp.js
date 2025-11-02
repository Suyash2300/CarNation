/**
 * Test Brevo SMTP connection directly
 * Run: node test-smtp.js recipient@example.com
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const testEmail = process.argv[2] || 'anish.vishwakarma@gmail.com';

const smtpUser = process.env.BREVO_SMTP_USER;
const smtpPass = process.env.BREVO_SMTP_PASSWORD;
const smtpHost = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
const smtpPort = parseInt(process.env.BREVO_SMTP_PORT || '587');
const fromEmail = process.env.BREVO_FROM_EMAIL || 'CarNation <carnation71212@gmail.com>';

console.log('🧪 Testing Brevo SMTP Connection...\n');
console.log(`SMTP Host: ${smtpHost}`);
console.log(`SMTP Port: ${smtpPort}`);
console.log(`SMTP User: ${smtpUser ? smtpUser.substring(0, 10) + '...' : '❌ NOT SET'}`);
console.log(`SMTP Pass: ${smtpPass ? '✅ SET (' + smtpPass.length + ' chars)' : '❌ NOT SET'}`);
console.log(`From Email: ${fromEmail}`);
console.log(`To Email: ${testEmail}\n`);

if (!smtpUser || !smtpPass) {
  console.error('❌ SMTP credentials not configured!');
  console.error('Please set BREVO_SMTP_USER and BREVO_SMTP_PASSWORD in .env');
  process.exit(1);
}

try {
  console.log('📤 Creating SMTP transporter...');
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  console.log('🔍 Verifying SMTP connection...');
  await transporter.verify();

  console.log('✅ SMTP connection verified!\n');
  console.log('📧 Sending test email...\n');

  const info = await transporter.sendMail({
    from: fromEmail,
    to: testEmail,
    subject: '🧪 Test Email from CarNation (SMTP)',
    html: `
      <h2>SMTP Test Email</h2>
      <p>This is a test email to verify Brevo SMTP is working correctly!</p>
      <p>If you received this, your SMTP setup is ✅ working.</p>
    `,
    text: 'SMTP Test Email - This is a test email to verify Brevo SMTP is working correctly!',
  });

  console.log('✅ Email sent successfully!');
  console.log(`   Message ID: ${info.messageId}`);
  console.log(`   Recipient: ${testEmail}`);
  console.log(`\n📧 Check inbox: ${testEmail}`);
  console.log('   (Also check spam/junk folder)');
} catch (error) {
  console.error('\n❌ Error:');
  console.error(`   Message: ${error.message}`);
  
  if (error.code) {
    console.error(`   Code: ${error.code}`);
  }
  
  if (error.response) {
    console.error(`   Response: ${error.response}`);
  }
  
  if (error.command) {
    console.error(`   Command: ${error.command}`);
  }
  
  console.error('\n💡 Common issues:');
  console.error('   1. Wrong SMTP username/password');
  console.error('   2. SMTP account not activated in Brevo');
  console.error('   3. Network/firewall blocking port 587');
  console.error('   4. Brevo SMTP service temporarily down');
  
  process.exit(1);
}

