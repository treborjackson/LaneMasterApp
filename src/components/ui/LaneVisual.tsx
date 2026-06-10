interface LaneVisualProps {
  length:     number;
  difficulty: string;
}

const DIFFICULTY_COLORS: Record<string, { oil: string; label: string }> = {
  Easy:   { oil: '#2e6da4', label: 'House Oil' },
  Medium: { oil: '#e8a020', label: 'Moderate'  },
  Hard:   { oil: '#c0392b', label: 'Sport'      },
  Sport:  { oil: '#8e44ad', label: 'Sport'      },
};

// Oil ratio by difficulty — controls how much the crown drops off toward gutters
const CROWN_RATIO: Record<string, number> = {
  Easy:   0.85,  // heavy crown, almost no oil outside
  Medium: 0.55,
  Hard:   0.25,
  Sport:  0.15,  // nearly flat
};

const PIN_POSITIONS = [
  // [board, row] — board 1=right gutter, 20=center
  [20, 0],                          // head pin
  [17.5, 1], [22.5, 1],            // 2, 3
  [15, 2], [20, 2], [25, 2],       // 4, 5, 6
  [12.5, 3], [17.5, 3], [22.5, 3], [27.5, 3], // 7-10
] as const;

export function LaneVisual({ length, difficulty }: LaneVisualProps) {
  const { oil: oilColor } = DIFFICULTY_COLORS[difficulty] ?? DIFFICULTY_COLORS.Easy;
  const crown  = CROWN_RATIO[difficulty] ?? 0.5;

  // SVG dimensions
  const W = 300;
  const H = 220;

  // Lane occupies full SVG width minus gutters
  const GUTTER = 10;
  const laneL  = GUTTER;
  const laneR  = W - GUTTER;
  const laneW  = laneR - laneL;

  // Y positions (0 = top/pins, H = bottom/foul line)
  const foulY   = H - 14;
  const pinTopY = 10;
  const oilEndY = foulY - (length / 60) * (foulY - pinTopY);
  const arrowY  = foulY - (15 / 60) * (foulY - pinTopY);
  const dotY    = foulY - (7 / 60) * (foulY - pinTopY);

  // 39 boards
  const boards = Array.from({ length: 39 }, (_, i) => laneL + (i / 38) * laneW);

  // Key board positions (board 1 = right gutter, board 39 = left gutter)
  function boardX(board: number) {
    return laneL + ((39 - board) / 38) * laneW;
  }

  // Arrows at boards 5, 10, 15, 20, 25, 30, 35
  const arrowBoards = [5, 10, 15, 20, 25, 30, 35];

  // Approach dots at boards 3, 5, 8, 11, 14 (mirrored)
  const dotBoards = [5, 10, 15, 20, 25, 30, 35];

  // Build oil profile gradient stops — crown shape
  // x=0 is left gutter, x=1 is right gutter
  // Oil is max at center (board 20), drops off per crown ratio
  function oilOpacity(board: number) {
    const dist = Math.abs(board - 20) / 19; // 0=center, 1=gutter
    return Math.max(0, 1 - dist * (1 / crown) * 0.9) * 0.55;
  }

  const gradientStops = Array.from({ length: 20 }, (_, i) => {
    const board = 1 + i * 2;
    const pct   = ((39 - board) / 38) * 100;
    return { pct, opacity: oilOpacity(board) };
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-faint)' }}>
          Lane View (top-down)
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm inline-block opacity-70" style={{ background: oilColor }} />
          <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
            Oil · {length} ft
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-lg overflow-hidden"
        style={{ maxHeight: 240 }}
      >
        {/* Definitions */}
        <defs>
          {/* Wood grain background gradient */}
          <linearGradient id="woodGrain" x1="0" y1="0" x2="1" y2="0">
            {boards.map((x, i) => (
              <stop
                key={i}
                offset={`${((x - laneL) / laneW) * 100}%`}
                stopColor={i % 2 === 0 ? '#c4983a' : '#b88a30'}
              />
            ))}
          </linearGradient>

          {/* Oil pattern gradient (cross-lane) */}
          <linearGradient id="oilGrad" x1="0" y1="0" x2="1" y2="0">
            {gradientStops.map((s, i) => (
              <stop
                key={i}
                offset={`${s.pct}%`}
                stopColor={oilColor}
                stopOpacity={s.opacity}
              />
            ))}
          </linearGradient>

          {/* Gutter shadow */}
          <linearGradient id="gutterL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a0e04" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1a0e04" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gutterR" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a0e04" stopOpacity="0" />
            <stop offset="100%" stopColor="#1a0e04" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="#1a0e04" />

        {/* Lane bed */}
        <rect x={laneL} y={pinTopY} width={laneW} height={foulY - pinTopY} fill="url(#woodGrain)" />

        {/* Board lines */}
        {boards.map((x, i) => (
          <line
            key={i}
            x1={x} y1={pinTopY}
            x2={x} y2={foulY}
            stroke="#9a6e20"
            strokeWidth="0.4"
            strokeOpacity="0.5"
          />
        ))}

        {/* Oil zone */}
        <rect
          x={laneL} y={oilEndY}
          width={laneW} height={foulY - oilEndY}
          fill="url(#oilGrad)"
        />

        {/* Oil end line */}
        <line
          x1={laneL} y1={oilEndY}
          x2={laneR} y2={oilEndY}
          stroke={oilColor}
          strokeWidth="1.5"
          strokeOpacity="0.7"
          strokeDasharray="4 3"
        />

        {/* Oil length label */}
        <rect
          x={laneR + 1} y={oilEndY - 7}
          width={22} height={14}
          rx="3"
          fill={oilColor}
          fillOpacity="0.9"
        />
        <text
          x={laneR + 12} y={oilEndY + 4}
          textAnchor="middle"
          fill="white"
          fontSize="8"
          fontWeight="bold"
        >
          {length}ft
        </text>

        {/* Approach dots */}
        {dotBoards.map((b) => (
          <circle
            key={b}
            cx={boardX(b)} cy={dotY}
            r="2.5"
            fill="#2a1a08"
            stroke="#9a6e20"
            strokeWidth="1"
          />
        ))}

        {/* Arrows (chevron / triangle shape) */}
        {arrowBoards.map((b) => {
          const ax = boardX(b);
          return (
            <polygon
              key={b}
              points={`${ax},${arrowY - 5} ${ax - 4},${arrowY + 3} ${ax + 4},${arrowY + 3}`}
              fill="#7a5010"
              stroke="#b88030"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Gutter shadows */}
        <rect x={0} y={pinTopY} width={GUTTER + 4} height={foulY - pinTopY} fill="url(#gutterL)" />
        <rect x={laneR - 4} y={pinTopY} width={GUTTER + 4} height={foulY - pinTopY} fill="url(#gutterR)" />

        {/* Foul line */}
        <rect x={laneL} y={foulY} width={laneW} height={3} fill="#1a0e04" />
        <text
          x={laneL - 2} y={foulY + 10}
          textAnchor="end"
          fill="#6b4a20"
          fontSize="7"
        >
          Foul
        </text>

        {/* Pin spots */}
        {PIN_POSITIONS.map(([board, row], i) => {
          const px = boardX(board);
          const py = pinTopY + 4 + row * 10;
          return (
            <circle
              key={i}
              cx={px} cy={py}
              r="3.5"
              fill="#e8dfc8"
              stroke="#9a7a40"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Dry zone label */}
        <text
          x={laneR - 2} y={(oilEndY + pinTopY + 30) / 2}
          textAnchor="end"
          fill="#9a6e20"
          fontSize="7"
          fontStyle="italic"
        >
          dry
        </text>

        {/* Arrows label */}
        <text
          x={laneL - 2} y={arrowY + 3}
          textAnchor="end"
          fill="#6b4a20"
          fontSize="7"
        >
          15ft
        </text>
      </svg>

      {/* Board reference */}
      <div className="flex justify-between mt-1 px-2 text-[9px]" style={{ color: 'var(--text-faint)' }}>
        <span>Board 39 (L)</span>
        <span>Center (20)</span>
        <span>Board 1 (R)</span>
      </div>
    </div>
  );
}
