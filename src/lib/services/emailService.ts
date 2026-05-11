import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Initialize Resend only if API key exists
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface EmailData {
  to: string;
  shareableId: string;
  totalSavings: number;
  totalAnnualSavings: number;
  toolsCount: number;
  company?: string;
}

export async function sendAuditConfirmationEmail(data: EmailData): Promise<{ success: boolean; message?: string }> {
  if (!resend) {
    console.warn('⚠️ Resend API key missing. Email not sent.');
    return { success: false, message: 'Email service not configured' };
  }

  if (!data.to || !data.to.includes('@')) {
    console.warn('Invalid email address:', data.to);
    return { success: false, message: 'Invalid email address' };
  }

  try {
    const shareableUrl = `${APP_URL}/audit/${data.shareableId}`;
    // const savingsText = data.totalSavings > 0 
    //   ? `Save $${data.totalSavings}/month ($${data.totalAnnualSavings}/year)`
    //   : `Your AI stack is optimized`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your AI Spend Audit Results</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #1f2937; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
          .savings { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .savings-number { font-size: 32px; font-weight: bold; }
          .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          .high-savings { background: #f3e8ff; border-left: 4px solid #9333ea; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 AI Spend Audit Results</h1>
          </div>
          <div class="content">
            <p>Hello${data.company ? ` from ${data.company}` : ''}!</p>
            
            <p>Your AI spend audit is complete. We analyzed <strong>${data.toolsCount} tools</strong> in your stack.</p>
            
            <div class="savings">
              <div class="savings-number">${data.totalSavings > 0 ? `$${data.totalSavings}/month` : 'Already Optimized'}</div>
              <div>${data.totalSavings > 0 ? `That's $${data.totalAnnualSavings}/year in potential savings` : 'No major savings found'}</div>
            </div>
            
            <div style="text-align: center;">
              <a href="${shareableUrl}" class="button">📊 View Your Full Audit Report</a>
            </div>
            
            ${data.totalSavings > 500 ? `
              <div class="high-savings">
                <strong>🎉 High Savings Detected!</strong><br />
                You're saving over $500/month with our recommendations. A Credex specialist will reach out within 24 hours to discuss how discounted AI credits can increase your savings even further.
              </div>
            ` : ''}
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
            
            <div style="font-size: 14px; color: #6b7280;">
              <p><strong>What's next?</strong></p>
              <ul>
                <li>📈 Share your results with your team</li>
                <li>💰 Implement the recommended changes</li>
                <li>🚀 Book a consultation for major savings</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>Sent by Credex — Discounted AI infrastructure credits for startups</p>
            <p><a href="${APP_URL}">credex.rocks</a> | <a href="${APP_URL}/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
      Your AI Spend Audit Results
        
      Hello${data.company ? ` from ${data.company}` : ''}!
      
      Your AI spend audit is complete. We analyzed ${data.toolsCount} tools in your stack.
      
      ${data.totalSavings > 0 ? `Save $${data.totalSavings}/month ($${data.totalAnnualSavings}/year)` : 'Your AI stack is already optimized'}
      
      View your full audit report: ${shareableUrl}
      
      ${data.totalSavings > 500 ? 'High Savings Detected! A Credex specialist will reach out.' : ''}
      
      ---
      Sent by Credex — Discounted AI infrastructure credits for startups
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.to],
      subject: data.totalSavings > 0 
        ? `🎯 Your AI Audit: Save $${data.totalSavings}/month on AI tools`
        : `📊 Your AI Spend Audit Results`,
      html: emailHtml,
      text: emailText,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      return { success: false, message: result.error.message };
    }

    console.log('✅ Audit email sent to:', data.to);
    return { success: true, message: 'Email sent successfully' };
    
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}