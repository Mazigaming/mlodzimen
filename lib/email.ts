// import nodemailer from 'nodemailer';

export async function verifyEmail(token: string): Promise<boolean> {
  return token.length > 10;
}

export async function sendVerificationEmail(email: string, token: string, baseUrl?: string) {
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/verify-email?token=${token}`;

  // EmailJS OTP template for email verification
  // Use separate template ID for verification (will be provided)
  const verificationTemplateId = process.env.EMAILJS_VERIFICATION_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
  if (process.env.EMAILJS_SERVICE_ID && verificationTemplateId) {
    console.log('=== VERIFICATION EMAIL (EmailJS OTP Template) ===');
    console.log(`To: ${email}`);
    console.log(`Template: ${verificationTemplateId}`);
    console.log(`OTP Code: ${token}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('================================');
    // TODO: Uncomment when verification template ID is provided:
    // const templateParams = {
    //   to_email: email,
    //   otp_code: token,
    //   verify_url: verificationUrl
    // };
    // emailjs.send(...)
    return true;
  }

  // Fallback to console logging
  console.log('=== VERIFICATION EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Zweryfikuj swój email - Młodzi Mentorzy`);
  console.log(`OTP Code: ${token}`);
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

  // Only password reset uses EmailJS template_fx3q3me
  if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID) {
    console.log('=== PASSWORD RESET EMAIL (EmailJS) ===');
    console.log(`To: ${email}`);
    console.log(`Template: ${process.env.EMAILJS_TEMPLATE_ID}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('================================');
    return true;
  }

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
