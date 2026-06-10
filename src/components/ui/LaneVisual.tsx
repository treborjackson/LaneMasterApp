interface LaneVisualProps {
  length:     number;
  difficulty: string;
}

const CROWN_RATIO: Record<string, number> = {
  Easy:   0.90,
  Medium: 0.60,
  Hard:   0.30,
  Sport:  0.12,
};

function oilDepth(board: number, crown: number): number {
  const dist = Math.abs(board - 20) / 19;
  return Math.max(0, 1 - Math.pow(dist / crown, 0.7));
}

// Returns SVG-safe stopColor + stopOpacity
function depthStop(depth: number): { color: string; opacity: number } {
  if (depth <= 0.02) return { color: '#c4983a', opacity: 0 };
  if (depth < 0.25)  return { color: '#d8b4fe', opacity: Math.min(depth * 1.8, 0.55) };
  if (depth < 0.55)  return { color: '#a855f7', opacity: 0.45 + depth * 0.25 };
  if (depth < 0.80)  return { color: '#7e22ce', opacity: 0.60 + depth * 0.2 };
  return               { color: '#4c1d95', opacity: 0.75 + depth * 0.2 };
}

const PIN_POSITIONS = [
  [20, 0],
  [17.5, 1], [22.5, 1],
  [15, 2],   [20, 2],   [25, 2],
  [12.5, 3], [17.5, 3], [22.5, 3], [27.5, 3],
] as const;

export function LaneVisual({ length, difficulty }: LaneVisualProps) {
  const crown = CROWN_RATIO[difficulty] ?? 0.5;

  const W = 300;
  const H = 230;

  const GUTTER  = 10;
  const laneL   = GUTTER;
  const laneR   = W - GUTTER;
  const laneW   = laneR - laneL;
  const foulY   = H - 22;
  const pinTopY = 10;
  const oilEndY = foulY - (length / 60) * (foulY - pinTopY);
  const arrowY  = foulY - (15 / 60) * (foulY - pinTopY);

  const boards      = Array.from({ length: 39 }, (_, i) => i + 1);
  const arrowBoards = [5, 10, 15, 20, 25, 30, 35];

  function boardX(b: number) {
    return laneL + ((39 - b) / 38) * laneW;
  }

  const oilStops = boards.map((b) => ({
    pct:  ((39 - b) / 38) * 100,
    ...depthStop(oilDepth(b, crown)),
  }));

  const legend = [
    { color: '#4c1d95', opacity: 0.92, label: 'Heavy' },
    { color: '#7e22ce', opacity: 0.70, label: 'Medium' },
    { color: '#d8b4fe', opacity: 0.55, label: 'Light'  },
    { color: '#c4983a', opacity: 0.20, label: 'Dry'    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-faint)' }}>
          Oil Pattern · {length} ft
        </span>
        <div className="flex items-center gap-2">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-0.5">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block border border-white/10"
                style={{ background: l.color, opacity: l.opacity }}
              />
              <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg overflow-hidden" style={{ maxHeight: 250 }}>
        <defs>
          <linearGradient id="woodGrain" x1="0" y1="0" x2="1" y2="0">
            {boards.map((b, i) => (
              <stop
                key={i}
                offset={`${((39 - b) / 38) * 100}%`}
                stopColor={i % 2 === 0 ? '#c4983a' : '#b08030'}
              />
            ))}
          </linearGradient>

          {/* Oil depth gradient — uses proper stopColor + stopOpacity */}
          <linearGradient id="oilDepth" x1="0" y1="0" x2="1" y2="0">
            {oilStops.map((s, i) => (
              <stop
                key={i}
                offset={`${s.pct}%`}
                stopColor={s.color}
                stopOpacity={s.opacity}
              />
            ))}
          </linearGradient>

          <linearGradient id="gutterL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#120a02" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#120a02" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gutterR" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#120a02" stopOpacity="0" />
            <stop offset="100%" stopColor="#120a02" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="#120a02" />

        {/* Lane wood */}
        <rect x={laneL} y={pinTopY} width={laneW} height={foulY - pinTopY} fill="url(#woodGrain)" />

        {/* Board lines */}
        {boards.map((b) => (
          <line
            key={b}
            x1={boardX(b)} y1={pinTopY}
            x2={boardX(b)} y2={foulY}
            stroke="#8a6020" strokeWidth="0.4" strokeOpacity="0.45"
          />
        ))}

        {/* Oil zone overlaid on the lane */}
        <rect
          x={laneL} y={oilEndY}
          width={laneW} height={foulY - oilEndY}
          fill="url(#oilDepth)"
        />

        {/* Oil end dashed line */}
        <line
          x1={laneL} y1={oilEndY} x2={laneR} y2={oilEndY}
          stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.85" strokeDasharray="4 3"
        />

        {/* ft badge */}
        <rect x={laneR + 1} y={oilEndY - 8} width={24} height={14} rx="3" fill="#7e22ce" fillOpacity="0.9" />
        <text x={laneR + 13} y={oilEndY + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
          {length}ft
        </text>

        {/* Approach dots */}
        {[5, 10, 15, 20, 25, 30, 35].map((b) => (
          <circle
            key={b}
            cx={boardX(b)} cy={foulY - (7 / 60) * (foulY - pinTopY)}
            r="2.5" fill="#2a1a08" stroke="#9a6e20" strokeWidth="1"
          />
        ))}

        {/* Arrows */}
        {arrowBoards.map((b) => {
          const ax = boardX(b);
          return (
            <polygon
              key={b}
              points={`${ax},${arrowY - 5} ${ax - 4},${arrowY + 3} ${ax + 4},${arrowY + 3}`}
              fill="#6b4010" stroke="#b07828" strokeWidth="0.8"
            />
          );
        })}

        {/* Gutters */}
        <rect x={0}        y={pinTopY} width={GUTTER + 6} height={foulY - pinTopY} fill="url(#gutterL)" />
        <rect x={laneR - 6} y={pinTopY} width={GUTTER + 6} height={foulY - pinTopY} fill="url(#gutterR)" />

        {/* Foul line */}
        <rect x={laneL} y={foulY} width={laneW} height={3} fill="#120a02" />
        <text x={laneR + 2}    y={foulY + 10} fill="#5a3a10" fontSize="7">Foul</text>
        <text x={laneL - 2}    y={arrowY + 3} textAnchor="end" fill="#5a3a10" fontSize="7">15ft</text>
        <text x={laneR - 3}    y={(oilEndY + pinTopY) / 2 + 4} textAnchor="end" fill="#a07030" fontSize="7" fontStyle="italic">dry</text>

        {/* Pin spots */}
        {PIN_POSITIONS.map(([board, row], i) => (
          <circle
            key={i}
            cx={boardX(board)} cy={pinTopY + 4 + row * 10}
            r="3.5" fill="#e8dfc8" stroke="#9a7a40" strokeWidth="0.8"
          />
        ))}

        {/* Board numbers */}
        <text x={laneL + 1}       y={foulY + 14} fill="#5a3a10" fontSize="6.5">39</text>
        <text x={boardX(20) - 4}  y={foulY + 14} fill="#5a3a10" fontSize="6.5">20</text>
        <text x={laneR - 8}       y={foulY + 14} fill="#5a3a10" fontSize="6.5">1</text>
      </svg>
    </div>
  );
}
