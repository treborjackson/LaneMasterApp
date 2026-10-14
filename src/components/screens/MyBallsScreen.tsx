'use client';

import { useEffect, useState } from 'react';
import { useBallNotes } from '@/hooks/useBallNotes';
import { PageHeader } from '@/components/ui/PageHeader';
import { WoodCard } from '@/components/ui/WoodCard';
import type { BallNote } from '@/lib/types/ball';

const WEIGHTS = ['16 lbs', '15 lbs', '14 lbs', '13 lbs', '12 lbs', '11 lbs', '10 lbs'];
const SURFACES = ['Reactive Resin', 'Pearl Reactive', 'Solid Reactive', 'Hybrid Reactive', 'Urethane', 'Plastic / Spare'];
const STARS = [1, 2, 3, 4, 5];

const empty = { ballName: '', brand: '', weight: '', surface: '', videoId: '' as string | null, rating: 0, notes: '' };

export function MyBallsScreen() {
  const { notes, loading, fetchNotes, saveNote, deleteNote, searchVideo } = useBallNotes();
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<BallNote | null>(null);
  const [form, setForm]           = useState(empty);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [searching, setSearching]   = useState<string | null>(null); // ball id being searched

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setError('');
    setShowForm(true);
  }

  async function findVideo(note: BallNote) {
    setSearching(note.id);
    try {
      const videoId = await searchVideo(note.ballName, note.brand);
      if (videoId) {
        await saveNote({ ...note, videoId, weight: note.weight, surface: note.surface });
      }
    } finally {
      setSearching(null);
    }
  }

  function openEdit(note: BallNote) {
    setEditing(note);
    setForm({
      ballName: note.ballName,
      brand:    note.brand,
      weight:   note.weight   ?? '',
      surface:  note.surface  ?? '',
      videoId:  note.videoId  ?? null,
      rating:   note.rating,
      notes:    note.notes,
    });
    setError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.ballName.trim()) { setError('Ball name is required'); return; }
    if (!form.brand.trim())    { setError('Brand is required'); return; }
    setSaving(true);
    setError('');
    try {
      await saveNote({
        ballName: form.ballName.trim(),
        brand:    form.brand.trim(),
        weight:   form.weight  || null,
        surface:  form.surface || null,
        videoId:  form.videoId || null,
        rating:   form.rating,
        notes:    form.notes.trim(),
      });
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const inputStyle = {
    background: 'var(--bg-deep)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  };

  const selectStyle = { ...inputStyle };

  return (
    <div className="pb-8">
      <PageHeader title="My Bowling Balls" subtitle={`${notes.length} ball${notes.length !== 1 ? 's' : ''} in your bag`} emoji="🎳" />

      {/* Add Ball button */}
      {!showForm && (
        <div className="px-4 mb-4">
          <button onClick={openAdd}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}>
            + Add Ball to Bag
          </button>
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="px-4 mb-4">
          <div className="rounded-xl border p-4 space-y-3"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--accent)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
              {editing ? 'Edit Ball' : 'Add Ball to Bag'}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Ball Name *</p>
                <input value={form.ballName} onChange={(e) => set('ballName', e.target.value)}
                  placeholder="e.g. Phaze II"
                  disabled={!!editing}
                  className="w-full px-2 py-1.5 rounded-lg text-sm border outline-none disabled:opacity-60"
                  style={inputStyle} />
              </div>
              <div>
                <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Brand *</p>
                <input value={form.brand} onChange={(e) => set('brand', e.target.value)}
                  placeholder="e.g. Storm"
                  className="w-full px-2 py-1.5 rounded-lg text-sm border outline-none"
                  style={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Weight</p>
                <select value={form.weight} onChange={(e) => set('weight', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-sm border outline-none"
                  style={selectStyle}>
                  <option value="">— Select —</option>
                  {WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Cover Stock</p>
                <select value={form.surface} onChange={(e) => set('surface', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg text-sm border outline-none"
                  style={selectStyle}>
                  <option value="">— Select —</option>
                  {SURFACES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Your Rating</p>
              <div className="flex gap-2">
                {STARS.map((s) => (
                  <button key={s} type="button" onClick={() => set('rating', form.rating === s ? 0 : s)}
                    className="text-xl"
                    style={{ color: s <= form.rating ? '#f59e0b' : 'var(--text-faint)' }}>
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Notes</p>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                placeholder="e.g. Use on medium-heavy oil, drilled pin up"
                rows={2}
                className="w-full px-2 py-1.5 rounded-lg text-sm border outline-none resize-none"
                style={inputStyle} />
            </div>

            {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}>
                {saving ? 'Saving…' : 'Save Ball'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ball list */}
      {loading && (
        <div className="flex justify-center py-8">
          <p style={{ color: 'var(--text-faint)' }}>Loading…</p>
        </div>
      )}

      {!loading && notes.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center h-40 gap-2 px-4">
          <p className="text-3xl">🎳</p>
          <p className="text-sm text-center" style={{ color: 'var(--text-faint)' }}>
            Add your bowling balls to your bag
          </p>
        </div>
      )}

      <div className="px-4 flex flex-col gap-3">
        {notes.map((note) => {
          const isOpen = expanded === note.id;
          return (
            <WoodCard key={note.id} onClick={() => setExpanded(isOpen ? null : note.id)}>
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden"
                  style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)' }}>
                  {note.videoId ? (
                    <img
                      src={`https://img.youtube.com/vi/${note.videoId}/hqdefault.jpg`}
                      alt={note.ballName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎳</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {note.ballName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {note.brand}
                    {note.weight  && ` · ${note.weight}`}
                    {note.surface && ` · ${note.surface}`}
                  </p>
                  {note.rating > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: '#f59e0b' }}>
                      {'★'.repeat(note.rating)}{'☆'.repeat(5 - note.rating)}
                    </p>
                  )}
                </div>

                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-2">
                  {note.notes && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{note.notes}</p>
                  )}

                  {/* Video search / watch */}
                  {note.videoId ? (
                    <a href={`https://www.youtube.com/watch?v=${note.videoId}`} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: 'var(--accent)' }}>
                      ▶ Watch Review Video
                    </a>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); findVideo(note); }}
                      disabled={searching === note.id}
                      className="text-xs font-semibold disabled:opacity-50"
                      style={{ color: 'var(--accent)' }}>
                      {searching === note.id ? '🔍 Searching…' : '🔍 Find Ball Video'}
                    </button>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(note); }}
                      className="flex-1 py-1.5 rounded-lg text-xs border font-semibold"
                      style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                      Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                      className="px-3 py-1.5 rounded-lg text-xs border"
                      style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </WoodCard>
          );
        })}
      </div>
    </div>
  );
}
