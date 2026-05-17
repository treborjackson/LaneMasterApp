interface CompareBarProps {
  label:     string;
  userScore: number;
  proScore:  number;
}

export function CompareBar({ label, userScore, proScore }: CompareBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: 'var(--accent)' }}>You: {userScore}</span>
        <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ color: 'var(--blue)' }}>Pro: {proScore}</span>
      </div>
      <div className="flex gap-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${userScore}%`, background: 'var(--accent)' }}
        />
      </div>
      <div className="h-2 rounded-full overflow-hidden mt-0.5" style={{ background: 'var(--bg-muted)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${proScore}%`, background: 'var(--blue)' }}
        />
      </div>
    </div>
  );
}
