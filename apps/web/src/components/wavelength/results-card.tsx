import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsCardProps {
  points: number;
  targetPosition: number;
  guessPosition: number;
  clue: string;
  leftLabel: string;
  rightLabel: string;
}

export function ResultsCard({
  points,
  targetPosition,
  guessPosition,
  clue,
  leftLabel,
  rightLabel,
}: ResultsCardProps) {
  const getMessage = () => {
    switch (points) {
      case 4:
        return "¡Perfecto!";
      case 3:
        return "¡Casi Perfecto!";
      case 2:
        return "¡Buen intento!";
      default:
        return "Sigue intentando";
    }
  };

  const getColor = () => {
    switch (points) {
      case 4:
        return "text-green-500";
      case 3:
        return "text-blue-500";
      case 2:
        return "text-amber-500";
      default:
        return "text-muted-foreground";
    }
  };

  const Icon = points > 0 ? CheckCircle : XCircle;

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-surface p-6">
      {/* Mensaje y puntos */}
      <div className="flex flex-col items-center gap-2">
        <Icon className={cn("size-12", getColor())} />
        <h3 className={cn("text-2xl font-bold", getColor())}>{getMessage()}</h3>
      </div>

      {/* Puntos ganados */}
      <div className="flex items-center gap-2 rounded-xl bg-muted px-6 py-4">
        <span className={cn("text-5xl font-bold", getColor())}>+{points}</span>
        <span className="text-xl text-muted-foreground">puntos</span>
      </div>

      {/* Pista */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">La pista fue</p>
        <p className="text-xl font-semibold">"{clue}"</p>
      </div>

      {/* Espectro visual con semicírculo */}
      <ResultsDial
        targetPosition={targetPosition}
        guessPosition={guessPosition}
        leftLabel={leftLabel}
        rightLabel={rightLabel}
      />
    </div>
  );
}

// Componente del dial de resultados
function ResultsDial({
  targetPosition,
  guessPosition,
  leftLabel,
  rightLabel,
}: {
  targetPosition: number;
  guessPosition: number;
  leftLabel: string;
  rightLabel: string;
}) {
  // Convertir valor (0-100) a ángulo (180° a 0°)
  const valueToAngle = (val: number) => 180 - (val / 100) * 180;

  const targetAngle = valueToAngle(targetPosition);
  const guessAngle = valueToAngle(guessPosition);

  const radius = 120;
  const centerX = 150;
  const centerY = 140;

  // Calcular posición del indicador de guess
  const guessX = centerX + 90 * Math.cos((guessAngle * Math.PI) / 180);
  const guessY = centerY - 90 * Math.sin((guessAngle * Math.PI) / 180);

  // Renderizar zonas de puntuación con wrap-around
  const renderTargetZones = () => {
    // Zonas con bandas de igual ancho (5 unidades cada una)
    // 4 pts: ±2.5 del target (banda de 5 total)
    // 3 pts: 2.5-7.5 del target (banda de 5 a cada lado)
    // 2 pts: 7.5-12.5 del target (banda de 5 a cada lado)
    const zones = [
      { diff: 12.5, color: "#3b4b54", opacity: 1, points: 2 },   // 2 pts - gris oscuro
      { diff: 7.5, color: "#1e6a9e", opacity: 1, points: 3 },    // 3 pts - azul oscuro
      { diff: 2.5, color: "#13a4ec", opacity: 1, points: 4 },    // 4 pts - primary azul
    ];

    const arcElements: React.ReactNode[] = [];
    const textElements: React.ReactNode[] = [];

    zones.forEach((zone, i) => {
      // Calcular los límites de la zona
      const zoneStart = targetPosition - zone.diff;
      const zoneEnd = targetPosition + zone.diff;

      // Calcular el rango interno de esta zona específica
      const innerDiff = i === zones.length - 1 ? 0 : zones[i + 1]?.diff ?? 0;

      // Centro de la banda visible de esta zona
      // Para zona exterior (2pts): banda entre 10-15, centro en 12.5 del target
      // Para zona media (3pts): banda entre 5-10, centro en 7.5 del target
      // Para zona centro (4pts): banda entre 0-5, centro en 2.5 del target
      const bandCenter = (innerDiff + zone.diff) / 2;

      // Para la zona central (4 pts), poner solo un número en el centro
      const isInnerZone = innerDiff === 0;
      const zoneMidLeft = isInnerZone ? targetPosition : targetPosition - bandCenter;
      const zoneMidRight = isInnerZone ? targetPosition : targetPosition + bandCenter;

      // Zona principal (puede estar parcialmente fuera)
      const clampedStart = Math.max(0, zoneStart);
      const clampedEnd = Math.min(100, zoneEnd);

      if (clampedStart < clampedEnd) {
        const startAngle = valueToAngle(clampedEnd);
        const endAngle = valueToAngle(clampedStart);
        arcElements.push(createArcPath(`zone-main-${i}`, startAngle, endAngle, zone.color, zone.opacity));
      }

      // Wrap-around: si la zona se sale por la izquierda (< 0), aparece por la derecha
      if (zoneStart < 0) {
        const wrapStart = 100 + zoneStart;
        const wrapEnd = 100;
        const startAngle = valueToAngle(wrapEnd);
        const endAngle = valueToAngle(wrapStart);
        arcElements.push(createArcPath(`zone-wrap-left-${i}`, startAngle, endAngle, zone.color, zone.opacity));
      }

      // Wrap-around: si la zona se sale por la derecha (> 100), aparece por la izquierda
      if (zoneEnd > 100) {
        const wrapStart = 0;
        const wrapEnd = zoneEnd - 100;
        const startAngle = valueToAngle(wrapEnd);
        const endAngle = valueToAngle(wrapStart);
        arcElements.push(createArcPath(`zone-wrap-right-${i}`, startAngle, endAngle, zone.color, zone.opacity));
      }

      // Agregar texto para zona izquierda (si está visible)
      if (zoneMidLeft >= 0 && zoneMidLeft <= 100) {
        const textAngle = valueToAngle(zoneMidLeft);
        const textRadius = 108; // Cerca del borde para que no lo tape la aguja
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

      // Agregar texto para zona derecha (si está visible y no es el centro)
      if (zoneMidRight >= 0 && zoneMidRight <= 100 && Math.abs(zoneMidRight - zoneMidLeft) > 8) {
        const textAngle = valueToAngle(zoneMidRight);
        const textRadius = 108; // Cerca del borde para que no lo tape la aguja
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

    // Retornar arcs primero, luego textos encima
    return [...arcElements, ...textElements];
  };

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

  return (
    <div className="flex w-full flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
      {/* Labels */}
      <div className="flex w-full max-w-75 items-center justify-between px-2">
        <span className="text-sm font-medium">{leftLabel}</span>
        <span className="text-sm font-medium">{rightLabel}</span>
      </div>

      {/* SVG Dial */}
      <svg viewBox="0 0 300 160" className="w-full max-w-75">
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

        {/* Zonas de puntuación con wrap-around */}
        {renderTargetZones()}

        {/* Aguja/indicador del guess */}
        <line
          x1={centerX}
          y1={centerY}
          x2={guessX}
          y2={guessY}
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-foreground"
        />

        {/* Centro del dial */}
        <circle cx={centerX} cy={centerY} r="12" className="fill-muted-foreground" />
        <circle cx={centerX} cy={centerY} r="6" className="fill-background" />
      </svg>
    </div>
  );
}
