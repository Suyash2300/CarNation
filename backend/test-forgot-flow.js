/**
 * Test the complete forgot password flow
 */
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { sendPasswordResetEmail } from './src/utils/email.js';

dotenv.config();

const prisma = new PrismaClient();
const testEmail = 'aniish.vishwakarma@gmail.com';

async function testFlow() {
  try {
    console.log('🧪 Testing complete forgot password flow...\n');
    
    // 1. Check user exists
    const user = await prisma.user.findUnique({
      where: { email: testEmail.toLowerCase() },
    });
    
    if (!user) {
      console.log('❌ User not found:', testEmail);
      return;
    }
    
    console.log('✅ User found:', user.email, '(' + user.name + ')\n');
    
    // 2. Generate reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=test-token-123&email=${encodeURIComponent(user.email)}`;
    console.log('📋 Reset URL:', resetUrl, '\n');
    
    // 3. Send email
    console.log('📤 Sending password reset email...\n');
    await sendPasswordResetEmail(user.email, resetUrl);
    
    console.log('\n✅ SUCCESS! Email sent via forgot password flow!');
    console.log('📧 Check inbox:', testEmail);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testFlow();
