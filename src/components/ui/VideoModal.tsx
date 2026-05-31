'use client';

interface VideoModalProps {
  youtubeId: string;
  title:     string;
  onClose:   () => void;
}

export function VideoModal({ youtubeId, title, onClose }: VideoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl overflow-hidden border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{title}</span>
          <button onClick={onClose} className="text-lg ml-2" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>
        <div className="aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
