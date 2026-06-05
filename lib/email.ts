import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'Młodzi Mentorzy <onboarding@resend.dev>';

const TEST_RECIPIENT = process.env.EMAIL_TEST_RECIPIENT || null;

function getRecipient(originalEmail: string) {
  if (TEST_RECIPIENT) {
    console.log(`[EMAIL TEST MODE] Overriding recipient ${originalEmail} → ${TEST_RECIPIENT}`);
    return TEST_RECIPIENT;
  }
  return originalEmail;
}

export async function sendVerificationEmail(email: string, code: string) {
  const recipient = getRecipient(email);

  if (!resend) {
    console.log('=== VERIFICATION EMAIL (Resend not configured) ===');
    console.log(`To: ${recipient}`);
    console.log(`OTP Code: ${code}`);
    console.log('================================================');
    return true;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject: 'Zweryfikuj swój email - Młodzi Mentorzy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Witaj w Młodzi Mentorzy!</h2>
          <p style="color: #475569; font-size: 16px;">Dziękujemy za rejestrację. Twój kod weryfikacyjny to:</p>
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0; border: 2px solid #e2e8f0;">
            <span style="font-size: 42px; font-weight: 800; letter-spacing: 8px; color: #2563eb; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #475569; font-size: 15px;">Wprowadź ten kod w aplikacji, aby aktywować swoje konto.</p>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">Jeśli to nie Ty zakładałeś konto, możesz bezpiecznie zignorować tę wiadomość.</p>
        </div>
      `,
    });
    console.log(`[RESEND SUCCESS] Verification email sent to ${recipient}`);
    console.dir(result, { depth: null });
    return true;
  } catch (error) {
    console.error('[RESEND ERROR] Verification email failed:');
    console.dir(error, { depth: null });
    console.log(`=== VERIFICATION EMAIL (fallback) ===`);
    console.log(`To: ${recipient}`);
    console.log(`OTP Code: ${code}`);
    return true;
  }
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const recipient = getRecipient(email);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  if (!resend) {
    console.log('=== PASSWORD RESET EMAIL (Resend not configured) ===');
    console.log(`To: ${recipient}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('===================================================');
    return true;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject: 'Resetowanie hasła - Młodzi Mentorzy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Resetowanie hasła</h2>
          <p style="color: #475569; font-size: 16px;">Otrzymaliśmy prośbę o zresetowanie hasła dla Twojego konta.</p>
          <p style="color: #475569; font-size: 15px; margin: 16px 0;">Kliknij w poniższy link, aby zresetować swoje hasło:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Zresetuj Hasło</a>
          </div>
          <p style="color: #475569; font-size: 15px;">Link jest ważny przez <strong>1 godzinę</strong>.</p>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">Jeśli to nie Ty prosiłeś o reset hasła, możesz bezpiecznie zignorować tę wiadomość.</p>
        </div>
      `,
    });
    console.log(`[RESEND SUCCESS] Password reset sent to ${recipient}`);
    console.dir(result, { depth: null });
    return true;
  } catch (error) {
    console.error('[RESEND ERROR] Password reset failed:');
    console.dir(error, { depth: null });
    console.log(`=== PASSWORD RESET EMAIL (fallback) ===`);
    console.log(`To: ${recipient}`);
    console.log(`Reset Link: ${resetLink}`);
    return true;
  }
}

export async function sendMentorApplicationEmail(applicantEmail: string) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mlodzimentorzy.pl';
  const recipient = getRecipient(adminEmail);

  if (!resend) {
    console.log('=== MENTOR APPLICATION EMAIL (Resend not configured) ===');
    console.log(`To: ${recipient}`);
    console.log(`Applicant: ${applicantEmail}`);
    console.log('================================================');
    return true;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject: 'Nowa aplikacja mentora - Młodzi Mentorzy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Nowa aplikacja mentora</h2>
          <p style="color: #475569; font-size: 16px;">Użytkownik <strong>${applicantEmail}</strong> złożył aplikację na mentora.</p>
          <p style="color: #475569; font-size: 15px;">Zaloguj się do panelu admina, aby przejrzeć szczegóły i zatwierdzić lub odrzucić aplikację.</p>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">Jeśli to nie Ty, możesz zignorować tę wiadomość.</p>
        </div>
      `,
    });
    console.log(`[RESEND SUCCESS] Mentor application email sent to ${recipient}`);
    console.dir(result, { depth: null });
    return true;
  } catch (error) {
    console.error('[RESEND ERROR] Mentor application email failed:');
    console.dir(error, { depth: null });
    console.log(`=== MENTOR APPLICATION EMAIL (fallback) ===`);
    console.log(`To: ${recipient}`);
    console.log(`Applicant: ${applicantEmail}`);
    return true;
  }
}
