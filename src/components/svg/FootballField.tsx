import type { FormationPlayer } from "@/types";

interface Props {
  players?: FormationPlayer[];
  showLabels?: boolean;
  showPassingLines?: boolean;
  showArrows?: boolean;
  className?: string;
}

export function FootballField({ players = [], showLabels = true, showPassingLines = false, showArrows = false, className }: Props) {
  return (
    <svg
      viewBox="0 0 100 140"
      className={className}
      role="img"
      aria-label="Football pitch diagram"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      {/* Pitch */}
      <defs>
        <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-pitch)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--color-pitch)" stopOpacity="1" />
        </linearGradient>
        <pattern id="stripes" width="100" height="14" patternUnits="userSpaceOnUse">
          <rect width="100" height="14" fill="url(#pitchGrad)" />
          <rect width="100" height="7" fill="oklch(1 0 0 / 0.05)" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="100" height="140" fill="url(#stripes)" rx="3" />

      {/* Outer lines */}
      <g stroke="var(--color-pitch-line)" strokeWidth="0.5" fill="none">
        <rect x="2" y="2" width="96" height="136" />
        {/* Halfway */}
        <line x1="2" y1="70" x2="98" y2="70" />
        <circle cx="50" cy="70" r="9" />
        <circle cx="50" cy="70" r="0.8" fill="var(--color-pitch-line)" stroke="none" />
        {/* Top box (opponent goal) */}
        <rect x="22" y="2" width="56" height="16" />
        <rect x="36" y="2" width="28" height="6" />
        <circle cx="50" cy="14" r="0.8" fill="var(--color-pitch-line)" stroke="none" />
        <path d="M 30 18 A 12 12 0 0 0 70 18" />
        {/* Bottom box (own goal) */}
        <rect x="22" y="122" width="56" height="16" />
        <rect x="36" y="132" width="28" height="6" />
        <circle cx="50" cy="126" r="0.8" fill="var(--color-pitch-line)" stroke="none" />
        <path d="M 30 122 A 12 12 0 0 1 70 122" />
        {/* Corner arcs */}
        <path d="M 2 4 A 2 2 0 0 0 4 2" />
        <path d="M 98 4 A 2 2 0 0 1 96 2" />
        <path d="M 2 136 A 2 2 0 0 1 4 138" />
        <path d="M 98 136 A 2 2 0 0 0 96 138" />
      </g>

      {/* Passing lines */}
      {showPassingLines &&
        players.map((p, i) => {
          const next = players[i + 1];
          if (!next) return null;
          return (
            <line
              key={`pl-${i}`}
              x1={p.x}
              y1={4 + (p.y / 100) * 132}
              x2={next.x}
              y2={4 + (next.y / 100) * 132}
              stroke="var(--color-accent)"
              strokeWidth="0.3"
              strokeDasharray="1 1"
              opacity="0.6"
            />
          );
        })}

      {/* Players */}
      {players.map((p, i) => {
        const cy = 4 + (p.y / 100) * 132;
        const isGK = p.role === "GK";
        return (
          <g key={i} style={{ animation: `fade-in 0.4s ease ${i * 0.03}s both` }}>
            <circle
              cx={p.x}
              cy={cy}
              r="3.6"
              fill={isGK ? "var(--color-accent)" : "var(--color-primary)"}
              stroke="var(--color-pitch-line)"
              strokeWidth="0.4"
            />
            {showArrows && !isGK && p.y > 30 && p.y < 90 && (
              <path
                d={`M ${p.x} ${cy - 5} L ${p.x} ${cy - 9} M ${p.x - 1.3} ${cy - 7.5} L ${p.x} ${cy - 9} L ${p.x + 1.3} ${cy - 7.5}`}
                stroke="var(--color-accent)"
                strokeWidth="0.5"
                fill="none"
              />
            )}
            {showLabels && (
              <text
                x={p.x}
                y={cy + 1.3}
                textAnchor="middle"
                fontSize="2.6"
                fontWeight="700"
                fill={isGK ? "oklch(0.2 0.04 90)" : "var(--color-primary-foreground)"}
              >
                {p.role}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
