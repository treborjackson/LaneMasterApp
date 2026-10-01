'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { apiGetInvites, apiSendInvite, apiRevokeInvite } from '@/lib/api';
import { WoodCard } from '@/components/ui/WoodCard';
import { PageHeader } from '@/components/ui/PageHeader';

interface Invite {
  id:        string;
  email:     string;
  status:    string;
  expiresAt: string;
  createdAt: string;
  usedAt:    string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending:  'var(--accent)',
  accepted: 'var(--blue)',
};

export function AdminScreen() {
  const { token } = useAppStore();
  const [invites, setInvites]   = useState<Invite[]>([]);
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [lastLink, setLastLink] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGetInvites(token);
      setInvites(data.invites ?? []);
    } catch {
      setError('Could not load invites');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !email.trim()) return;
    setSending(true);
    setError('');
    setSuccess('');
    setLastLink('');
    try {
      const data = await apiSendInvite(token, email.trim());
      setLastLink(data.inviteUrl ?? '');
      if (data.emailError) {
        setSuccess(`Invite created — copy the link below (email failed: ${data.emailError})`);
      } else if (data.inviteUrl && !process.env.NEXT_PUBLIC_RESEND_CONFIGURED) {
        setSuccess(`Invite created — copy the link below to share`);
      } else {
        setSuccess(`Invite sent to ${email.trim()}`);
      }
      setEmail('');
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setSending(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!token) return;
    try {
      await apiRevokeInvite(token, id);
      await load();
    } catch {
      setError('Could not revoke invite');
    }
  }

  const pending  = invites.filter((i) => i.status === 'pending');
  const accepted = invites.filter((i) => i.status === 'accepted');

  return (
    <div className="pb-4">
      <PageHeader title="Admin" subtitle="Manage invites" emoji="🔐" />

      {/* Send invite form */}
      <div className="px-4 mb-6">
        <WoodCard>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--accent)' }}>✉️ Send Invite</p>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 flex-shrink-0"
              style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
            >
              {sending ? '…' : 'Send'}
            </button>
          </form>

          {error   && <p className="text-xs mt-2" style={{ color: 'var(--red)' }}>{error}</p>}
          {success && <p className="text-xs mt-2" style={{ color: 'var(--blue)' }}>{success}</p>}

          {lastLink && (
            <div className="mt-3">
              <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Invite link — share this directly:</p>
              <div
                className="flex items-center gap-2 rounded-lg p-2"
                style={{ background: 'var(--bg-muted)' }}
              >
                <p className="text-[10px] flex-1 break-all font-mono" style={{ color: 'var(--text-muted)' }}>
                  {lastLink}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(lastLink).catch(() => {})}
                  className="text-[10px] px-2 py-1 rounded flex-shrink-0"
                  style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </WoodCard>
      </div>

      {/* Invite stats */}
      <div className="px-4 mb-4 flex gap-3">
        {[
          { label: 'Pending',  count: pending.length,  color: 'var(--accent)' },
          { label: 'Accepted', count: accepted.length, color: 'var(--blue)'   },
        ].map((s) => (
          <div key={s.label} className="flex-1 rounded-lg p-3 text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invite list */}
      <div className="px-4 flex flex-col gap-2">
        {loading && (
          <p className="text-xs text-center py-8" style={{ color: 'var(--text-faint)' }}>Loading…</p>
        )}
        {!loading && invites.length === 0 && (
          <p className="text-xs text-center py-8" style={{ color: 'var(--text-faint)' }}>
            No invites yet — send one above
          </p>
        )}
        {invites.map((invite) => {
          const expired = invite.status === 'pending' && new Date(invite.expiresAt) < new Date();
          return (
            <WoodCard key={invite.id}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {invite.email}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    Sent {new Date(invite.createdAt).toLocaleDateString()}
                    {invite.usedAt && ` · Accepted ${new Date(invite.usedAt).toLocaleDateString()}`}
                    {expired && ' · Expired'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: STATUS_COLORS[invite.status] ?? 'var(--bg-muted)', color: '#fff' }}
                  >
                    {expired ? 'Expired' : invite.status}
                  </span>
                  {invite.status === 'pending' && (
                    <button
                      onClick={() => handleRevoke(invite.id)}
                      className="text-[10px] px-2 py-1 rounded"
                      style={{ background: 'var(--bg-muted)', color: 'var(--red)' }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </WoodCard>
          );
        })}
      </div>
    </div>
  );
}
