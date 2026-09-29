import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendInviteEmail(to: string, inviteUrl: string): Promise<void> {
  if (!resend) return;

  await resend.emails.send({
    from:    'Lane Master <onboarding@resend.dev>',
    to,
    subject: "You're invited to Lane Master",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#1a1208;color:#e8d5b0;border-radius:12px">
        <h1 style="color:#d4a843;font-size:24px;margin:0 0 8px">🎳 Lane Master</h1>
        <p style="color:#a08060;margin:0 0 24px">AI-powered bowling coaching</p>
        <p style="margin:0 0 24px">You've been invited to join Lane Master. Click the button below to create your account.</p>
        <a href="${inviteUrl}"
           style="display:inline-block;background:#d4a843;color:#1a0a00;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px">
          Accept Invite
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#6b5b3e">
          This invite expires in 7 days. If you didn't expect this, you can ignore it.
        </p>
      </div>
    `,
  });
}
