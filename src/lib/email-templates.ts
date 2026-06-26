import 'server-only';

/** Branded OTP verification email. Inline styles for email-client safety. */
export function otpEmailTemplate(code: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `${code} is your MTK verification code`;

  const text = [
    'Welcome to MTK.',
    '',
    `Your verification code is: ${code}`,
    '',
    'Enter this code to verify your email. It expires in 10 minutes.',
    "If you didn't create an MTK account, you can ignore this email.",
  ].join('\n');

  const html = `
  <div style="margin:0;padding:0;background:#faf8f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #ece7df;">
            <tr>
              <td style="padding:40px 40px 8px 40px;">
                <div style="font-size:13px;letter-spacing:0.3em;text-transform:uppercase;color:#c8a97e;font-weight:600;">MTK</div>
                <h1 style="margin:20px 0 0 0;font-size:24px;line-height:1.2;color:#1c1917;font-weight:600;">Verify your email</h1>
                <p style="margin:14px 0 0 0;font-size:15px;line-height:1.6;color:#57534e;">
                  Use the code below to finish creating your account.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px;">
                <div style="background:#faf8f5;border:1px solid #ece7df;border-radius:4px;padding:22px;text-align:center;">
                  <div style="font-size:34px;letter-spacing:10px;font-weight:700;color:#1c1917;font-family:'Courier New',monospace;">${code}</div>
                </div>
                <p style="margin:18px 0 0 0;font-size:13px;line-height:1.6;color:#78716c;text-align:center;">
                  This code expires in 10 minutes.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 40px 40px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#a8a29e;border-top:1px solid #ece7df;padding-top:20px;">
                  If you didn't create an MTK account, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;

  return { subject, html, text };
}
