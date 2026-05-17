interface ScoreBarProps {
  label: string;
  value: number;
  max?:  number;
  color?: string;
}

export function ScoreBar({ label, value, max = 100, color = 'var(--accent)' }: ScoreBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
        <span>{label}</span>
        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{value}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
