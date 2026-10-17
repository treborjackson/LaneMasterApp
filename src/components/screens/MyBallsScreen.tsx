'use client';

import { useEffect, useState, useRef } from 'react';
import { useBallNotes } from '@/hooks/useBallNotes';
import { PageHeader } from '@/components/ui/PageHeader';
import { WoodCard } from '@/components/ui/WoodCard';
import { VideoModal } from '@/components/ui/VideoModal';
import type { BallNote } from '@/lib/types/ball';

const WEIGHTS = ['16 lbs', '15 lbs', '14 lbs', '13 lbs', '12 lbs', '11 lbs', '10 lbs'];
const SURFACES = ['Reactive Resin', 'Pearl Reactive', 'Solid Reactive', 'Hybrid Reactive', 'Urethane', 'Plastic / Spare'];
const STARS = [1, 2, 3, 4, 5];

// Popular bowling balls catalog — name + brand for autocomplete
const BALL_CATALOG: { name: string; brand: string }[] = [
  // Storm
  { name: 'Phaze II', brand: 'Storm' }, { name: 'Phaze III', brand: 'Storm' }, { name: 'Phaze 4', brand: 'Storm' },
  { name: 'Hy-Road', brand: 'Storm' }, { name: 'Hy-Road Pearl', brand: 'Storm' }, { name: 'Hy-Road X', brand: 'Storm' },
  { name: 'IQ Tour', brand: 'Storm' }, { name: 'IQ Tour Pearl', brand: 'Storm' }, { name: 'IQ Tour Fusion', brand: 'Storm' },
  { name: 'Proton PhysiX', brand: 'Storm' }, { name: 'Neutron', brand: 'Storm' }, { name: 'Electrify Pearl', brand: 'Storm' },
  { name: 'Marvel Pearl', brand: 'Storm' }, { name: 'Marvel Maxx', brand: 'Storm' }, { name: 'Code Red', brand: 'Storm' },
  { name: 'Code X', brand: 'Storm' }, { name: 'Optimus', brand: 'Storm' },
  // Roto Grip
  { name: 'Hustle Ink', brand: 'Roto Grip' }, { name: 'Hustle AU', brand: 'Roto Grip' }, { name: 'Hustle Camo', brand: 'Roto Grip' },
  { name: 'Idol Pearl', brand: 'Roto Grip' }, { name: 'Idol Synergy', brand: 'Roto Grip' }, { name: 'Idol Cosmos', brand: 'Roto Grip' },
  { name: 'Gem', brand: 'Roto Grip' }, { name: 'Rubicon', brand: 'Roto Grip' }, { name: 'RST X-1', brand: 'Roto Grip' },
  { name: 'Halo', brand: 'Roto Grip' }, { name: 'Halo Pearl', brand: 'Roto Grip' },
  // Motiv
  { name: 'Forge Fire', brand: 'Motiv' }, { name: 'Forge Ember', brand: 'Motiv' }, { name: 'Forge Flare', brand: 'Motiv' },
  { name: 'Venom Shock', brand: 'Motiv' }, { name: 'Venom Shock Pearl', brand: 'Motiv' },
  { name: 'Trident Horizon', brand: 'Motiv' }, { name: 'Trident Nemesis', brand: 'Motiv' }, { name: 'Trident Abyss', brand: 'Motiv' },
  { name: 'Fatal Venom', brand: 'Motiv' }, { name: 'Jackal Ghost', brand: 'Motiv' }, { name: 'Jackal Legacy', brand: 'Motiv' },
  { name: 'Tank Rampage', brand: 'Motiv' },
  // Hammer
  { name: 'Black Widow 2.0', brand: 'Hammer' }, { name: 'Black Widow Ghost', brand: 'Hammer' }, { name: 'Black Widow Viz-A-Ball', brand: 'Hammer' },
  { name: 'Rip\'d', brand: 'Hammer' }, { name: 'Rip\'d Pearl', brand: 'Hammer' }, { name: 'Rip\'d Solid', brand: 'Hammer' },
  { name: 'Scandal', brand: 'Hammer' }, { name: 'Scandal Pearl', brand: 'Hammer' },
  { name: 'Gauntlet', brand: 'Hammer' }, { name: 'Gauntlet Pearl', brand: 'Hammer' },
  // Brunswick
  { name: 'Quantum Evo', brand: 'Brunswick' }, { name: 'Quantum Evo Pearl', brand: 'Brunswick' },
  { name: 'Cosmos', brand: 'Brunswick' }, { name: 'Rhino', brand: 'Brunswick' }, { name: 'Twist', brand: 'Brunswick' },
  { name: 'Crown Maxxx', brand: 'Brunswick' }, { name: 'Magnitude 035', brand: 'Brunswick' },
  { name: 'Endeavor', brand: 'Brunswick' }, { name: 'Endeavor Pearl', brand: 'Brunswick' },
  // Track
  { name: 'A10', brand: 'Track' }, { name: 'Paradox', brand: 'Track' }, { name: 'Paradox Pearl', brand: 'Track' },
  { name: 'Stealth', brand: 'Track' },
  // Columbia 300
  { name: 'Savage', brand: 'Columbia 300' }, { name: 'Clutch', brand: 'Columbia 300' }, { name: 'White Dot', brand: 'Columbia 300' },
  // Ebonite
  { name: 'Cyclone', brand: 'Ebonite' }, { name: 'Game Breaker 4', brand: 'Ebonite' }, { name: 'Game Breaker 3', brand: 'Ebonite' },
  { name: 'Maxim', brand: 'Ebonite' },
  // 900 Global
  { name: 'Zen', brand: '900 Global' }, { name: 'Zen Soul', brand: '900 Global' }, { name: 'Dream On', brand: '900 Global' },
  { name: 'Wolverine', brand: '900 Global' },
  // DV8
  { name: 'Pitbull Bite', brand: 'DV8' }, { name: 'Pitbull Pearl', brand: 'DV8' }, { name: 'Pitbull Growl', brand: 'DV8' },
  { name: 'Hellcat', brand: 'DV8' }, { name: 'Thug', brand: 'DV8' },
  // Radical
  { name: 'Squatch', brand: 'Radical' }, { name: 'Conspiracy Theory', brand: 'Radical' }, { name: 'Ridiculous', brand: 'Radical' },
  // Lane Masters / Legends
  { name: 'Angle', brand: 'Lane Masters' }, { name: 'Gold', brand: 'Lane Masters' },
];

const empty = { ballName: '', brand: '', weight: '', surface: '', videoId: '' as string | null, rating: 0, notes: '' };

export function MyBallsScreen() {
  const { notes, loading, fetchNotes, saveNote, deleteNote, searchVideo } = useBallNotes();
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<BallNote | null>(null);
  const [form, setForm]           = useState(empty);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [searching, setSearching]   = useState<string | null>(null);
  const [video, setVideo]           = useState<{ youtubeId: string; title: string } | null>(null);
  const [suggestions, setSuggestions] = useState<{ name: string; brand: string }[]>([]);
  const suggestRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  function onBallNameChange(value: string) {
    set('ballName', value);
    if (value.trim().length < 2) { setSuggestions([]); return; }
    const q = value.toLowerCase();
    setSuggestions(
      BALL_CATALOG.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 6)
    );
  }

  function pickSuggestion(ball: { name: string; brand: string }) {
    setForm((f) => ({ ...f, ballName: ball.name, brand: ball.brand }));
    setSuggestions([]);
  }

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
              <div className="relative" ref={suggestRef}>
                <p className="text-[10px] mb-1" style={{ color: 'var(--text-faint)' }}>Ball Name *</p>
                <input
                  value={form.ballName}
                  onChange={(e) => onBallNameChange(e.target.value)}
                  onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                  placeholder="e.g. Phaze II"
                  disabled={!!editing}
                  className="w-full px-2 py-1.5 rounded-lg text-sm border outline-none disabled:opacity-60"
                  style={inputStyle}
                />
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 rounded-lg border z-20 overflow-hidden"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--accent)' }}>
                    {suggestions.map((s) => (
                      <button
                        key={`${s.brand}-${s.name}`}
                        type="button"
                        onPointerDown={() => pickSuggestion(s)}
                        className="w-full text-left px-3 py-2 text-xs border-b last:border-b-0"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'transparent' }}>
                        <span className="font-semibold">{s.name}</span>
                        <span className="ml-1" style={{ color: 'var(--text-faint)' }}>· {s.brand}</span>
                      </button>
                    ))}
                  </div>
                )}
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
                <div
                  className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden relative"
                  style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)' }}
                  onClick={note.videoId ? (e) => { e.stopPropagation(); setVideo({ youtubeId: note.videoId!, title: note.ballName }); } : undefined}
                >
                  {note.videoId ? (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${note.videoId}/hqdefault.jpg`}
                        alt={note.ballName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.35)' }}>
                        <span className="text-white text-lg">▶</span>
                      </div>
                    </>
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
                    <button
                      onClick={(e) => { e.stopPropagation(); setVideo({ youtubeId: note.videoId!, title: note.ballName }); }}
                      className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: 'var(--accent)' }}>
                      ▶ Watch Review Video
                    </button>
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

      {video && (
        <VideoModal youtubeId={video.youtubeId} title={video.title} onClose={() => setVideo(null)} />
      )}
    </div>
  );
}
