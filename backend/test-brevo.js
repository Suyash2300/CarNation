/**
 * Test Brevo email sending directly
 * Run: node test-brevo.js recipient@example.com
 */

import dotenv from 'dotenv';
import * as brevo from '@getbrevo/brevo';

dotenv.config();

const testEmail = process.argv[2] || 'anish.vishwakarma@gmail.com';
const brevoApiKey = process.env.BREVO_API_KEY;

if (!brevoApiKey) {
  console.error('❌ BREVO_API_KEY is not set in .env');
  process.exit(1);
}

console.log('🧪 Testing Brevo email sending...\n');
console.log(`API Key: ${brevoApiKey.substring(0, 20)}...`);
console.log(`To: ${testEmail}\n`);

// Initialize Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(0, brevoApiKey);

const fromEmail = process.env.BREVO_FROM_EMAIL || 'CarNation <carnation71212@gmail.com>';
let fromName = 'CarNation';
let fromAddress = 'carnation71212@gmail.com';

if (fromEmail.includes('<')) {
  const match = fromEmail.match(/(.+?)\s*<(.+?)>/);
  if (match) {
    fromName = match[1].trim();
    fromAddress = match[2].trim();
  }
}

console.log(`From: ${fromName} <${fromAddress}>\n`);

const sendSmtpEmail = new brevo.SendSmtpEmail();
sendSmtpEmail.subject = '🧪 Test Email from CarNation';
sendSmtpEmail.htmlContent = `
  <h2>Test Email</h2>
  <p>This is a test email to verify Brevo is working correctly!</p>
  <p>If you received this, your Brevo setup is ✅ working.</p>
`;
sendSmtpEmail.textContent = 'Test Email - This is a test email to verify Brevo is working correctly!';
sendSmtpEmail.sender = { name: fromName, email: fromAddress };
sendSmtpEmail.to = [{ email: testEmail }];

try {
  console.log('📤 Sending test email...\n');
  const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
  
  console.log('✅ Email sent successfully!');
  console.log(`   Response:`, JSON.stringify(result.body, null, 2));
  console.log(`\n📧 Check inbox: ${testEmail}`);
  console.log('   (Also check spam/junk folder)');
} catch (error) {
  console.error('❌ Error sending email:');
  console.error('   Message:', error.message);
  if (error.response) {
    console.error('   Response status:', error.response.status);
    console.error('   Response headers:', JSON.stringify(error.response.headers, null, 2));
    console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
    console.error('   Full response:', JSON.stringify(error.response, null, 2));
  }
  if (error.body) {
    console.error('   Error body:', JSON.stringify(error.body, null, 2));
  }
  console.error('   Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  process.exit(1);
}

