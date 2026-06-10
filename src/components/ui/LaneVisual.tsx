interface LaneVisualProps {
  length:     number;
  difficulty: string;
}

// How far oil extends at a given board (shorter toward gutters on house shots)
function oilLengthAtBoard(board: number, patternLength: number, difficulty: string): number {
  const dist    = Math.abs(board - 20) / 19;
  const dropoff = { Easy: 0.68, Medium: 0.42, Hard: 0.22, Sport: 0.08 }[difficulty] ?? 0.35;
  const factor  = Math.max(0, 1 - Math.pow(dist, 1.15) * dropoff * 2);
  return patternLength * factor;
}

// How much oil is at a given board (crown = more oil in center)
function lateralFactor(board: number, difficulty: string): number {
  const dist  = Math.abs(board - 20) / 19;
  const angle = (dist * Math.PI) / 2;
  const cos   = Math.cos(angle);
  switch (difficulty) {
    case 'Easy':   return Math.max(0, Math.pow(cos, 1.6));
    case 'Medium': return Math.max(0, 0.30 + 0.70 * Math.pow(cos, 1.1));
    case 'Hard':   return Math.max(0, 0.52 + 0.48 * cos);
    case 'Sport':  return Math.max(0, 0.72 + 0.28 * cos);
    default:       return Math.max(0, Math.pow(cos, 1.6));
  }
}

// 4 stacked oil depth layers: light (full extent) → dark (near foul line only)
const LAYERS = [
  { heightFactor: 1.00, color: '#ede9fe', alpha: 0.55 },  // thin — full pattern extent
  { heightFactor: 0.72, color: '#c084fc', alpha: 0.62 },  // light
  { heightFactor: 0.46, color: '#9333ea', alpha: 0.72 },  // medium
  { heightFactor: 0.22, color: '#581c87', alpha: 0.90 },  // heavy — near foul line
];

const PIN_POSITIONS = [
  [20, 0],
  [17.5, 1], [22.5, 1],
  [15,   2], [20,   2], [25,   2],
  [12.5, 3], [17.5, 3], [22.5, 3], [27.5, 3],
] as const;

const FT_LABELS    = [0, 10, 20, 30, 40, 50, 60];
const BOARD_LABELS = [5, 10, 15, 20, 25, 30, 35];
const ARROW_BOARDS = [5, 10, 15, 20, 25, 30, 35];

export function LaneVisual({ length, difficulty }: LaneVisualProps) {
  const W = 300;
  const H = 270;

  const LEFT_MARGIN = 20;  // room for ft labels
  const laneL = LEFT_MARGIN;
  const laneR = W - 30;   // room for ft badge
  const laneW = laneR - laneL;

  const foulY   = H - 26;
  const pinTopY = 14;
  const laneH   = foulY - pinTopY;

  const boards = Array.from({ length: 39 }, (_, i) => i + 1);
  const bWidth = laneW / 39;

  function boardX(b: number) {
    return laneL + ((b - 1) / 38) * laneW;
  }

  function ftToY(ft: number) {
    return foulY - (ft / 60) * laneH;
  }

  const arrowY = ftToY(15);

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-faint)' }}>
          Oil Pattern · {length} ft
        </span>
        <div className="flex items-center gap-2">
          {[
            { color: '#581c87', label: 'Heavy' },
            { color: '#9333ea', label: 'Mid'   },
            { color: '#c084fc', label: 'Light' },
            { color: '#ede9fe', label: 'Thin'  },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-0.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block border border-white/10" style={{ background: l.color }} />
              <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg overflow-hidden" style={{ maxHeight: 280 }}>
        <defs>
          <linearGradient id="woodGrain" x1="0" y1="0" x2="1" y2="0">
            {boards.map((b, i) => (
              <stop key={i} offset={`${((b - 1) / 38) * 100}%`} stopColor={i % 2 === 0 ? '#c4983a' : '#b08030'} />
            ))}
          </linearGradient>
          <linearGradient id="gL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#100800" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#100800" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gR" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#100800" stopOpacity="0" />
            <stop offset="100%" stopColor="#100800" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="#100800" />

        {/* Lane wood */}
        <rect x={laneL} y={pinTopY} width={laneW} height={laneH} fill="url(#woodGrain)" />

        {/* Board lines */}
        {boards.map((b) => (
          <line key={b}
            x1={boardX(b)} y1={pinTopY} x2={boardX(b)} y2={foulY}
            stroke="#8a6020" strokeWidth="0.35" strokeOpacity="0.4"
          />
        ))}

        {/* Oil depth layers — rendered per board */}
        {boards.flatMap((b) => {
          const bx      = laneL + ((b - 1) / 38) * laneW - bWidth * 0.1;
          const lat     = lateralFactor(b, difficulty);
          const fullLen = oilLengthAtBoard(b, length, difficulty);
          if (fullLen < 0.5 || lat < 0.015) return [];

          return LAYERS.map((layer) => {
            const layerLen = fullLen * layer.heightFactor;
            const layerY   = ftToY(layerLen);
            const h        = foulY - layerY;
            if (h < 0.5) return null;
            return (
              <rect
                key={`${b}-${layer.color}`}
                x={bx} y={layerY}
                width={bWidth + 0.5}
                height={h}
                fill={layer.color}
                fillOpacity={layer.alpha * lat}
              />
            );
          });
        })}

        {/* Oil end dashed line */}
        <line
          x1={laneL} y1={ftToY(length)} x2={laneR} y2={ftToY(length)}
          stroke="#a855f7" strokeWidth="1.2" strokeOpacity="0.75" strokeDasharray="4 3"
        />

        {/* ft badge */}
        <rect x={laneR + 2} y={ftToY(length) - 7} width={24} height={14} rx="3" fill="#7e22ce" fillOpacity="0.9" />
        <text x={laneR + 14} y={ftToY(length) + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
          {length}ft
        </text>

        {/* Arrows at 15ft */}
        {ARROW_BOARDS.map((b) => {
          const ax = boardX(b);
          return (
            <polygon key={b}
              points={`${ax},${arrowY - 4} ${ax - 3},${arrowY + 3} ${ax + 3},${arrowY + 3}`}
              fill="#6b4010" stroke="#c08028" strokeWidth="0.7"
            />
          );
        })}

        {/* Gutters */}
        <rect x={0}        y={pinTopY} width={LEFT_MARGIN + 2} height={laneH} fill="url(#gL)" />
        <rect x={laneR - 2} y={pinTopY} width={W - laneR + 4} height={laneH} fill="url(#gR)" />

        {/* Foul line */}
        <rect x={laneL} y={foulY}     width={laneW} height={2.5} fill="#100800" />
        <rect x={laneL} y={foulY + 1} width={laneW} height={1}   fill="#888" fillOpacity="0.5" />

        {/* Y-axis ft labels */}
        {FT_LABELS.map((ft) => (
          <g key={ft}>
            <line x1={laneL - 3} y1={ftToY(ft)} x2={laneL} y2={ftToY(ft)} stroke="#5a3a10" strokeWidth="0.8" />
            <text x={laneL - 5} y={ftToY(ft) + 3} textAnchor="end" fill="#7a5a28" fontSize="7">
              {ft}
            </text>
          </g>
        ))}

        {/* Board labels on X-axis */}
        {BOARD_LABELS.map((b) => (
          <text key={b} x={boardX(b)} y={foulY + 11} textAnchor="middle" fill="#5a3a10" fontSize="6">
            {b}
          </text>
        ))}

        {/* Pin spots */}
        {PIN_POSITIONS.map(([board, row], i) => (
          <circle key={i}
            cx={boardX(board)} cy={pinTopY + 3 + row * 9}
            r="3" fill="#e8dfc8" stroke="#9a7a40" strokeWidth="0.8"
          />
        ))}
      </svg>
    </div>
  );
}
