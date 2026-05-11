import emailjs from '@emailjs/browser';

export async function verifyEmail(token: string): Promise<boolean> {
  return token.length > 10;
}

export async function sendVerificationEmail(email: string, code: string) {
  if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_USER_ID && process.env.EMAILJS_VERIFICATION_TEMPLATE_ID) {
    try {
      const templateParams = {
        to_email: email,
        otp_code: code,
        subject: 'Zweryfikuj swój email - Młodzi Mentorzy'
      };

      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_VERIFICATION_TEMPLATE_ID,
        templateParams,
        process.env.EMAILJS_USER_ID
      );

      console.log(`Verification email sent to ${email} with code ${code}`);
      return true;
    } catch (error) {
      console.error('EmailJS verification email failed:', error);
      return false;
    }
  }

  // Fallback to console logging
  console.log('=== VERIFICATION EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Zweryfikuj swój email - Młodzi Mentorzy`);
  console.log(`OTP Code: ${code}`);
  console.log('========================');
  return true;
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function sendPasswordResetEmail(email: string, code: string) {
  if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_USER_ID && process.env.EMAILJS_RESET_TEMPLATE_ID) {
    try {
      const templateParams = {
        to_email: email,
        otp_code: code,
        subject: 'Resetowanie hasła - Młodzi Mentorzy'
      };

      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_RESET_TEMPLATE_ID,
        templateParams,
        process.env.EMAILJS_USER_ID
      );

      console.log(`Password reset email sent to ${email} with code ${code}`);
      return true;
    } catch (error) {
      console.error('EmailJS password reset email failed:', error);
      return false;
    }
  }

  console.log('=== PASSWORD RESET EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Resetowanie hasła - Młodzi Mentorzy`);
  console.log(`OTP Code: ${code}`);
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
