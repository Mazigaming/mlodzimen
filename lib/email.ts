import nodemailer from 'nodemailer';

const hasSMTP = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
let transporter: any = null;
if (hasSMTP) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendViaEmailJS(serviceId: string, templateId: string, userIdOrPublicKey: string, templateParams: any) {
  try {
    // EmailJS supports either user_id (legacy) or public_key (newer). Send both fields if available.
    const body: any = { service_id: serviceId, template_id: templateId, template_params: templateParams };
    if (userIdOrPublicKey) {
      body.user_id = userIdOrPublicKey;
      body.public_key = userIdOrPublicKey;
    }
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    if (!res.ok) console.error('EmailJS response:', res.status, text);
    return res.ok;
  } catch (err) {
    console.error('EmailJS send failed:', err);
    return false;
  }
}

export async function verifyEmail(token: string): Promise<boolean> {
  return token.length > 5;
}

export async function sendVerificationEmail(email: string, code: string) {
  const mailFrom = process.env.SMTP_FROM || 'noreply@mlodzimentorzy.pl';

  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: 'Zweryfikuj swój email - Młodzi Mentorzy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1e293b;">Witaj w Młodzi Mentorzy!</h2>
        <p style="color: #475569; font-size: 16px;">Dziękujemy za rejestrację. Twój kod weryfikacyjny to:</p>
        <div style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">${code}</span>
        </div>
        <p style="color: #475569; font-size: 14px;">Wprowadź ten kod w aplikacji, aby aktywować swoje konto.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">Jeśli to nie Ty zakładałeś konto, zignoruj tę wiadomość.</p>
      </div>
    `,
  };

  // Prefer SMTP if configured
  if (hasSMTP && transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email} via SMTP`);
      return true;
    } catch (err) {
      console.error('SMTP verification failed:', err);
    }
  }

  // Fallback to EmailJS if configured
  const emailjsUser = process.env.EMAILJS_USER_ID || process.env.EMAILJS_PUBLIC_KEY;
  const emailjsKey = process.env.EMAILJS_USER_ID || process.env.EMAILJS_PUBLIC_KEY || process.env.EMAILJS_PUBLIC_KEY;
  if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_VERIFICATION_TEMPLATE_ID && emailjsKey) {
    const templateParams = { to_email: email, otp_code: code, subject: 'Zweryfikuj swój email - Młodzi Mentorzy' };
    const ok = await sendViaEmailJS(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_VERIFICATION_TEMPLATE_ID, emailjsKey, templateParams);
    if (ok) {
      console.log(`Verification email sent to ${email} via EmailJS`);
      return true;
    }
  }

  // Final fallback to console
  console.log('=== VERIFICATION EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`OTP Code: ${code}`);
  console.log('========================');
  return true;
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const mailFrom = process.env.SMTP_FROM || 'noreply@mlodzimentorzy.pl';
  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: 'Resetowanie hasła - Młodzi Mentorzy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1e293b;">Resetowanie hasła</h2>
        <p style="color: #475569; font-size: 16px;">Otrzymaliśmy prośbę o zresetowanie hasła. Twój kod resetujący to:</p>
        <div style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">${code}</span>
        </div>
        <p style="color: #475569; font-size: 14px;">Kod jest ważny przez 1 godzinę.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">Jeśli nie prosiłeś o reset hasła, możesz bezpiecznie zignorować tę wiadomość.</p>
      </div>
    `,
  };

  if (hasSMTP && transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email} via SMTP`);
      return true;
    } catch (err) {
      console.error('SMTP password reset failed:', err);
    }
  }

  if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_RESET_TEMPLATE_ID && process.env.EMAILJS_USER_ID) {
    const templateParams = { to_email: email, otp_code: code, subject: 'Resetowanie hasła - Młodzi Mentorzy' };
    const ok = await sendViaEmailJS(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_RESET_TEMPLATE_ID, process.env.EMAILJS_USER_ID, templateParams);
    if (ok) {
      console.log(`Password reset email sent to ${email} via EmailJS`);
      return true;
    }
  }

  // Fallback
  console.log('=== PASSWORD RESET EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`OTP Code: ${code}`);
  console.log('==============================');
  return true;
}

export async function sendMentorApplicationEmail(email: string) {
  const adminEmail = process.env.ADMIN_EMAIL || 'kontakt@mlodzimentorzy.pl';
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@mlodzimentorzy.pl',
    to: adminEmail,
    subject: 'Nowa aplikacja o status mentora - Młodzi Mentorzy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1e293b;">Nowa aplikacja o status mentora</h2>
        <p style="color: #475569; font-size: 16px;">Użytkownik <strong>${email}</strong> wysłał wniosek o status mentora.</p>
        <p style="color: #475569; font-size: 14px;">Sprawdź panel administratora, aby zweryfikować zgłoszenie.</p>
      </div>
    `,
  };

  if (hasSMTP && transporter) {
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.error('SMTP mentor application email failed:', err);
    }
  }

  if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_VERIFICATION_TEMPLATE_ID && process.env.EMAILJS_USER_ID) {
    const templateParams = { to_email: adminEmail, from_email: email, subject: 'Nowa aplikacja o status mentora' };
    const ok = await sendViaEmailJS(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_VERIFICATION_TEMPLATE_ID, process.env.EMAILJS_USER_ID, templateParams);
    if (ok) return true;
  }

  console.log('=== MENTOR APPLICATION EMAIL ===');
  console.log(`To: ${adminEmail}`);
  console.log(`From: ${email}`);
  console.log(`Subject: Nowa aplikacja o status mentora - Młodzi Mentorzy`);
  console.log('================================');
  return true;
}
