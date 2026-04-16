import nodemailer from 'nodemailer';

// For now, we'll use a simple console logging approach
// In production, replace with actual email service

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@mlodzimentorzy.pl',
    to: email,
    subject: 'Zweryfikuj swój email - Młodzi Mentorzy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Witaj w Młodzi Mentorzy!</h2>
        <p>Dziękujemy za rejestrację. Aby aktywować swoje konto, kliknij w poniższy link:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Zweryfikuj email
        </a>
        <p>Jeśli przycisk nie działa, skopiuj i wklej poniższy link do przeglądarki:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>Link wygaśnie za 24 godziny.</p>
        <p>Pozdrawienia,<br>Zespół Młodzi Mentorzy</p>
      </div>
    `,
  };

  try {
    // For development, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('=== VERIFICATION EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('========================');
      return true;
    }

    // In production, send actual email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}