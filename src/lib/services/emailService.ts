import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Initialize Resend only if API key exists
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface EmailData {
  to: string;
  auditId: string;
  shareableUrl: string;
  totalSavings: number;
}

export async function sendAuditConfirmationEmail(data: EmailData): Promise<boolean> {
  if (!resend) {
    console.warn('Resend API key missing. Email not sent.');
    return false;
  }

  try {
    const { to, auditId, shareableUrl, totalSavings } = data;

    const highSavingsNote =
      totalSavings > 500
        ? `<p style="margin-top: 20px; background: #f0fdf4; padding: 15px; border-radius: 8px;"><strong>🎉 High Savings Detected!</strong> One of our specialists will reach out within 24 hours to discuss how Credex credits can maximize your savings.</p>`
        : '';

    await resend.emails.send({
      from: 'Credex Audit <audits@credex.rocks>',
      to: [to],
      subject: `Your AI Spend Audit: Save $${totalSavings}/month`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Your AI Spend Audit Results</h1>
          <p>We've analyzed your AI tool spending and found potential savings of <strong>$${totalSavings}/month</strong>.</p>
          
          <div style="margin: 30px 0;">
            <a href="${shareableUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Your Full Audit
            </a>
          </div>
          
          ${highSavingsNote}
          
          <hr style="margin: 30px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            Sent by Credex — Discounted AI infrastructure credits for startups.<br />
            <a href="${APP_URL}/unsubscribe">Unsubscribe</a>
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}