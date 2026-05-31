'use client';

export function StatusBar() {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="flex items-center justify-between px-4 py-1 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
      <span>{time}</span>
      <div className="flex items-center gap-1">
        <span>●●●</span>
        <span>WiFi</span>
        <span>🔋</span>
      </div>
    </div>
  );
}
