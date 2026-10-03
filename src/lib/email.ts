import nodemailer from 'nodemailer';

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

export async function sendInviteEmail(to: string, inviteUrl: string, loginUrl: string): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from:    `"Lane Master" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Welcome to Lane Master!',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#1a1208;color:#e8d5b0;border-radius:12px">
        <h1 style="color:#d4a843;font-size:28px;margin:0 0 4px">🎳 Lane Master</h1>
        <p style="color:#a08060;margin:0 0 28px;font-size:13px">AI-powered bowling coaching</p>

        <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#e8d5b0">Welcome! You've been invited.</p>
        <p style="margin:0 0 24px;font-size:14px;color:#c4a878;line-height:1.6">
          You now have access to Lane Master — your personal AI bowling coach. To get started,
          create your account using the button below, then log in to start tracking your games,
          analyzing your form, and getting personalized coaching.
        </p>

        <a href="${inviteUrl}"
           style="display:inline-block;background:#d4a843;color:#1a0a00;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;margin-bottom:32px">
          Create My Account →
        </a>

        <div style="border-top:1px solid #3a2a10;padding-top:24px;margin-top:8px">
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#d4a843">How to log in after signing up:</p>
          <ol style="margin:0;padding-left:20px;font-size:13px;color:#a08060;line-height:2">
            <li>Click <strong style="color:#e8d5b0">Create My Account</strong> above and fill in your details</li>
            <li>Your invite code is pre-filled — no need to copy anything</li>
            <li>Once registered, visit <a href="${loginUrl}" style="color:#d4a843;text-decoration:none">${loginUrl}</a> to log in anytime</li>
            <li>Use your email and the password you chose to sign in</li>
          </ol>
        </div>

        <p style="margin:28px 0 0;font-size:11px;color:#6b5b3e">
          This invite expires in 7 days. If you didn't expect this email, you can safely ignore it.
        </p>
      </div>
    `,
  });
}
