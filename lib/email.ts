import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * From address for all transactional emails (verification + password reset).
 * 
 * Default: Resend's test domain (works immediately for testing).
 * 
 * For production:
 *   1. Verify your domain in Resend dashboard (e.g. mlodzimentorzy.pl)
 *   2. Set EMAIL_FROM="Młodzi Mentorzy <noreply@mlodzimentorzy.pl>" in .env
 */
const FROM_EMAIL = process.env.EMAIL_FROM || 'Młodzi Mentorzy <onboarding@resend.dev>';

export async function verifyEmail(token: string): Promise<boolean> {
  return token.length > 5;
}

export async function sendVerificationEmail(email: string, code: string) {
  if (!resend) {
    console.log('=== VERIFICATION EMAIL (Resend not configured) ===');
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${code}`);
    console.log('================================================');
    return true;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Zweryfikuj swój email - Młodzi Mentorzy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Witaj w Młodzi Mentorzy!</h2>
          <p style="color: #475569; font-size: 16px;">Dziękujemy za rejestrację. Twój kod weryfikacyjny to:</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0; border: 2px solid #e2e8f0;">
            <span style="font-size: 42px; font-weight: 800; letter-spacing: 8px; color: #2563eb; font-family: monospace;">${code}</span>
          </div>

          <p style="color: #475569; font-size: 15px;">Wprowadź ten kod w aplikacji, aby aktywować swoje konto.</p>
          
          <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">
            Jeśli to nie Ty zakładałeś konto, możesz bezpiecznie zignorować tę wiadomość.
          </p>
        </div>
      `,
    });

    console.log(`Verification email sent to ${email} via Resend`);
    return true;
  } catch (error) {
    console.error('Resend verification email failed:', error);
    // Fallback to console so the user can still continue
    console.log(`=== VERIFICATION EMAIL (fallback) ===`);
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${code}`);
    return true;
  }
}

export function generateVerificationToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendPasswordResetEmail(email: string, code: string) {
  if (!resend) {
    console.log('=== PASSWORD RESET EMAIL (Resend not configured) ===');
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${code}`);
    console.log('===================================================');
    return true;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Resetowanie hasła - Młodzi Mentorzy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Resetowanie hasła</h2>
          <p style="color: #475569; font-size: 16px;">Otrzymaliśmy prośbę o zresetowanie hasła dla Twojego konta.</p>
          
          <p style="color: #475569; font-size: 15px; margin: 16px 0;">Twój kod resetujący to:</p>

          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0; border: 2px solid #e2e8f0;">
            <span style="font-size: 42px; font-weight: 800; letter-spacing: 8px; color: #2563eb; font-family: monospace;">${code}</span>
          </div>

          <p style="color: #475569; font-size: 15px;">Kod jest ważny przez <strong>1 godzinę</strong>.</p>
          
          <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">
            Jeśli nie prosiłeś o reset hasła, możesz bezpiecznie zignorować tę wiadomość.
          </p>
        </div>
      `,
    });

    console.log(`Password reset email sent to ${email} via Resend`);
    return true;
  } catch (error) {
    console.error('Resend password reset email failed:', error);
    console.log(`=== PASSWORD RESET EMAIL (fallback) ===`);
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${code}`);
    return true;
  }
}

export async function sendMentorApplicationEmail(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL || 'kontakt@mlodzimentorzy.pl';

  if (!resend) {
    console.log('=== MENTOR APPLICATION EMAIL ===');
    console.log(`To: ${adminEmail}`);
    console.log(`From: ${email}`);
    return true;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: 'Nowa aplikacja o status mentora - Młodzi Mentorzy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Nowa aplikacja o status mentora</h2>
          <p>Użytkownik <strong>${email}</strong> wysłał wniosek o status mentora.</p>
          <p>Sprawdź panel administratora, aby zweryfikować zgłosnienie.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Resend mentor application email failed:', error);
    return true;
  }
}
