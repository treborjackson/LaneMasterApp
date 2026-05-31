interface LaneVisualProps {
  length:     number;
  difficulty: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy:   '#2e6da4',
  Medium: '#e8a020',
  Hard:   '#c0392b',
  Sport:  '#8e44ad',
};

export function LaneVisual({ length, difficulty }: LaneVisualProps) {
  const color = DIFFICULTY_COLORS[difficulty] ?? '#e8a020';
  const oilPct = Math.min((length / 60) * 100, 100);

  return (
    <div className="w-full">
      <div
        className="relative h-16 rounded-lg overflow-hidden border"
        style={{ background: 'var(--bg-muted)', borderColor: 'var(--border)' }}
      >
        {/* Lane boards */}
        {Array.from({ length: 39 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px opacity-10"
            style={{ left: `${(i / 39) * 100}%`, background: 'var(--brown-2)' }}
          />
        ))}
        {/* Oil zone */}
        <div
          className="absolute top-0 bottom-0 opacity-40 rounded"
          style={{ left: '20%', width: `${oilPct * 0.6}%`, background: color }}
        />
        {/* Labels */}
        <div className="absolute inset-x-0 top-1 flex justify-between px-2 text-[9px]" style={{ color: 'var(--text-faint)' }}>
          <span>Foul Line</span>
          <span>{length} ft</span>
          <span>Pins</span>
        </div>
      </div>
    </div>
  );
}
