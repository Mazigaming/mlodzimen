// import nodemailer from 'nodemailer';

export async function verifyEmail(token: string): Promise<boolean> {
  return token.length > 10;
}

export async function sendVerificationEmail(email: string, token: string, baseUrl?: string) {
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/verify-email?token=${token}`;

  if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID) {
    console.log('=== VERIFICATION EMAIL (EmailJS) ===');
    console.log(`To: ${email}`);
    console.log(`Template: ${process.env.EMAILJS_TEMPLATE_ID}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('================================');
    return true;
  }

  console.log('=== VERIFICATION EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Zweryfikuj swój email - Młodzi Mentorzy`);
  console.log(`Verification URL: ${verificationUrl}`);
  console.log('========================');
  return true;
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function sendPasswordResetEmail(email: string, token: string, baseUrl?: string) {
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  console.log('=== PASSWORD RESET EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Resetowanie hasła - Młodzi Mentorzy`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('==============================');
  return true;
}

export async function sendMentorApplicationEmail(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
  
  console.log('=== MENTOR APPLICATION EMAIL ===');
  console.log(`To: ${adminEmail}`);
  console.log(`From: ${email}`);
  console.log(`Subject: Nowa aplikacja o status mentora - Młodzi Mentorzy`);
  console.log('================================');
  return true;
}
