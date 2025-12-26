import { useState } from "react";
import { cn } from "@/lib/utils";

// Colores para cada jugador (hasta 12)
const PLAYER_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#84cc16", // lime
];

interface PlayerGuess {
  userId: string;
  position: number;
  finalPosition?: number;
  pointsEarned?: number;
  confirmed: boolean;
  player?: {
    _id: string;
    userId: string;
    name: string;
    avatarUrl?: string;
    score: number;
  };
}

interface MultiPlayerDialProps {
  playerGuesses: PlayerGuess[];
  currentUserId?: string;
  showTarget?: boolean;
  targetPosition?: number;
  leftLabel?: string;
  rightLabel?: string;
}

export function MultiPlayerDial({
  playerGuesses,
  currentUserId,
  showTarget = false,
  targetPosition,
  leftLabel,
  rightLabel,
}: MultiPlayerDialProps) {
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  // Convertir valor (0-100) a ángulo (180° a 0°)
  const valueToAngle = (val: number) => 180 - (val / 100) * 180;

  const radius = 120;
  const centerX = 150;
  const centerY = 140;
  const needleLength = 90;

  // Asignar colores a jugadores basándose en el orden
  const getPlayerColor = (index: number) => {
    return PLAYER_COLORS[index % PLAYER_COLORS.length];
  };

  // Zonas de puntuación (cuando se muestra el objetivo)
  const renderTargetZones = () => {
    if (!showTarget || targetPosition === undefined) return null;

    const zones = [
      { diff: 12.5, color: "#3b4b54", opacity: 1, points: 2 },
      { diff: 7.5, color: "#1e6a9e", opacity: 1, points: 3 },
      { diff: 2.5, color: "#13a4ec", opacity: 1, points: 4 },
    ];

    const createArcPath = (
      key: string,
      startAngle: number,
      endAngle: number,
      color: string,
      opacity: number
    ) => {
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY - radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY - radius * Math.sin(endRad);

      const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

      return (
        <path
          key={key}
          d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2} Z`}
          fill={color}
          opacity={opacity}
        />
      );
    };

    const arcElements: React.ReactNode[] = [];
    const textElements: React.ReactNode[] = [];

    zones.forEach((zone, i) => {
      const zoneStart = targetPosition - zone.diff;
      const zoneEnd = targetPosition + zone.diff;
      const innerDiff = i === zones.length - 1 ? 0 : zones[i + 1]?.diff ?? 0;
      const bandCenter = (innerDiff + zone.diff) / 2;
      const isInnerZone = innerDiff === 0;
      const zoneMidLeft = isInnerZone ? targetPosition : targetPosition - bandCenter;
      const zoneMidRight = isInnerZone ? targetPosition : targetPosition + bandCenter;

      const clampedStart = Math.max(0, zoneStart);
      const clampedEnd = Math.min(100, zoneEnd);

      if (clampedStart < clampedEnd) {
        const startAngle = valueToAngle(clampedEnd);
        const endAngle = valueToAngle(clampedStart);
        arcElements.push(createArcPath(`zone-main-${i}`, startAngle, endAngle, zone.color, zone.opacity));
      }

      if (zoneStart < 0) {
        const wrapStart = 100 + zoneStart;
        const startAngle = valueToAngle(100);
        const endAngle = valueToAngle(wrapStart);
        arcElements.push(createArcPath(`zone-wrap-left-${i}`, startAngle, endAngle, zone.color, zone.opacity));
      }

      if (zoneEnd > 100) {
        const wrapEnd = zoneEnd - 100;
        const startAngle = valueToAngle(wrapEnd);
        const endAngle = valueToAngle(0);
        arcElements.push(createArcPath(`zone-wrap-right-${i}`, startAngle, endAngle, zone.color, zone.opacity));
      }

      // Textos de puntuación
      if (zoneMidLeft >= 0 && zoneMidLeft <= 100) {
        const textAngle = valueToAngle(zoneMidLeft);
        const textRadius = 108;
        const textX = centerX + textRadius * Math.cos((textAngle * Math.PI) / 180);
        const textY = centerY - textRadius * Math.sin((textAngle * Math.PI) / 180);
        textElements.push(
          <text
            key={`text-left-${i}`}
            x={textX}
            y={textY}
            fill="#ffffff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {zone.points}
          </text>
        );
      }

      if (zoneMidRight >= 0 && zoneMidRight <= 100 && Math.abs(zoneMidRight - zoneMidLeft) > 8) {
        const textAngle = valueToAngle(zoneMidRight);
        const textRadius = 108;
        const textX = centerX + textRadius * Math.cos((textAngle * Math.PI) / 180);
        const textY = centerY - textRadius * Math.sin((textAngle * Math.PI) / 180);
        textElements.push(
          <text
            key={`text-right-${i}`}
            x={textX}
            y={textY}
            fill="#ffffff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {zone.points}
          </text>
        );
      }
    });

    return [...arcElements, ...textElements];
  };

  // Renderizar agujas de jugadores
  const renderPlayerNeedles = () => {
    return playerGuesses.map((guess, index) => {
      const angle = valueToAngle(guess.position);
      const needleX = centerX + needleLength * Math.cos((angle * Math.PI) / 180);
      const needleY = centerY - needleLength * Math.sin((angle * Math.PI) / 180);
      const color = getPlayerColor(index);
      const isCurrentUser = guess.userId === currentUserId;
      const isHovered = hoveredPlayer === guess.userId;

      // Posición del avatar (en la punta de la aguja)
      const avatarRadius = 4;
      const avatarX = needleX;
      const avatarY = needleY;

      return (
        <g
          key={guess.userId}
          onPointerEnter={() => setHoveredPlayer(guess.userId)}
          onPointerLeave={() => setHoveredPlayer(null)}
          className="cursor-pointer"
        >
          {/* Aguja */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke={color}
            strokeWidth={isCurrentUser ? 4 : 3}
            strokeLinecap="round"
            opacity={isHovered ? 1 : 0.8}
            className="transition-opacity duration-150"
          />

          {/* Círculo del avatar en la punta */}
          <circle
            cx={avatarX}
            cy={avatarY}
            r={avatarRadius + 2}
            fill={color}
            className="transition-transform duration-150"
            style={{
              transform: isHovered ? "scale(1.2)" : "scale(1)",
              transformOrigin: `${avatarX}px ${avatarY}px`,
            }}
          />

          {/* Avatar o inicial */}
          {guess.player?.avatarUrl ? (
            <clipPath id={`avatar-clip-${guess.userId}`}>
              <circle cx={avatarX} cy={avatarY} r={avatarRadius} />
            </clipPath>
          ) : null}

          {guess.player?.avatarUrl ? (
            <image
              href={guess.player.avatarUrl}
              x={avatarX - avatarRadius}
              y={avatarY - avatarRadius}
              width={avatarRadius * 2}
              height={avatarRadius * 2}
              clipPath={`url(#avatar-clip-${guess.userId})`}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <text
              x={avatarX}
              y={avatarY}
              fill="white"
              fontSize="5"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {guess.player?.name?.charAt(0)?.toUpperCase() || "?"}
            </text>
          )}

          {/* Tooltip con nombre (si está hovered) */}
          {isHovered && guess.player?.name && (
            <g>
              <rect
                x={avatarX - 30}
                y={avatarY - avatarRadius - 24}
                width={60}
                height={18}
                rx={4}
                fill="rgba(0,0,0,0.8)"
              />
              <text
                x={avatarX}
                y={avatarY - avatarRadius - 12}
                fill="white"
                fontSize="10"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {guess.player.name.length > 8 ? `${guess.player.name.slice(0, 8)}...` : guess.player.name}
              </text>
            </g>
          )}
        </g>
      );
    });
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* Labels */}
      {(leftLabel || rightLabel) && (
        <div className="flex w-full max-w-sm items-center justify-between px-2">
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase text-muted-foreground">Izquierda</span>
            <span className="text-sm font-semibold">{leftLabel}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase text-muted-foreground">Derecha</span>
            <span className="text-sm font-semibold">{rightLabel}</span>
          </div>
        </div>
      )}

      {/* SVG Dial */}
      <svg viewBox="0 0 300 180" className="w-full max-w-sm select-none">
        {/* ClipPaths para avatares */}
        <defs>
          {playerGuesses.map((guess) => (
            <clipPath key={`clip-${guess.userId}`} id={`avatar-clip-${guess.userId}`}>
              <circle cx="0" cy="0" r="12" />
            </clipPath>
          ))}
        </defs>

        {/* Borde exterior del dial */}
        <path
          d="M 26 140 A 124 124 0 0 1 274 140 L 150 140 Z"
          fill="#1c2a33"
        />

        {/* Fondo del semicírculo completo */}
        <path
          d="M 30 140 A 120 120 0 0 1 270 140 L 150 140 Z"
          fill="#2d3b45"
        />

        {/* Zonas de puntuación (cuando showTarget) */}
        {renderTargetZones()}

        {/* Agujas de todos los jugadores */}
        {renderPlayerNeedles()}

        {/* Centro del dial */}
        <circle cx={centerX} cy={centerY} r="10" fill="#4b5563" />
        <circle cx={centerX} cy={centerY} r="5" fill="#1f2937" />
      </svg>

      {/* Leyenda de jugadores */}
      {playerGuesses.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {playerGuesses.map((guess, index) => (
            <div
              key={guess.userId}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs",
                hoveredPlayer === guess.userId && "bg-muted"
              )}
              onPointerEnter={() => setHoveredPlayer(guess.userId)}
              onPointerLeave={() => setHoveredPlayer(null)}
            >
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: getPlayerColor(index) }}
              />
              <span className="max-w-20 truncate">
                {guess.player?.name || "Jugador"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
