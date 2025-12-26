import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SpectrumDialProps {
  value: number; // 0-100
  onChange?: (value: number) => void;
  disabled?: boolean;
  showTarget?: boolean;
  targetPosition?: number;
  leftLabel?: string;
  rightLabel?: string;
  hideNeedle?: boolean; // Oculta la aguja/indicador
}

export function SpectrumDial({
  value,
  onChange,
  disabled = false,
  showTarget = false,
  targetPosition,
  leftLabel,
  rightLabel,
  hideNeedle = false,
}: SpectrumDialProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // Convertir valor (0-100) a ángulo (180° a 0°, donde 180° es izquierda y 0° es derecha)
  const valueToAngle = (val: number) => 180 - (val / 100) * 180;
  const angleToValue = (angle: number) =>
    Math.max(0, Math.min(100, ((180 - angle) / 180) * 100));

  const calculateValue = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || !onChange || !svgRef.current) return;

      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();

      // El centro del dial está en el centro horizontal y aproximadamente 87.5% vertical
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.875;

      const x = clientX - centerX;
      const y = centerY - clientY;

      let angle = Math.atan2(y, x) * (180 / Math.PI);

      // Limitar al semicírculo superior (0° a 180°)
      if (angle < 0) angle = 0;
      if (angle > 180) angle = 180;

      const newValue = angleToValue(angle);
      onChange(Math.round(newValue));
    },
    [disabled, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || !onChange) return;
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    setIsDragging(true);
    calculateValue(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    calculateValue(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Manejar eventos globales para capturar movimientos fuera del SVG
  useEffect(() => {
    const handleGlobalMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      calculateValue(e.clientX, e.clientY);
    };

    const handleGlobalUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener("pointermove", handleGlobalMove, { passive: false });
      document.addEventListener("pointerup", handleGlobalUp);
      document.addEventListener("pointercancel", handleGlobalUp);
    }

    return () => {
      document.removeEventListener("pointermove", handleGlobalMove);
      document.removeEventListener("pointerup", handleGlobalUp);
      document.removeEventListener("pointercancel", handleGlobalUp);
    };
  }, [isDragging, calculateValue]);

  const angle = valueToAngle(value);
  const targetAngle = targetPosition !== undefined ? valueToAngle(targetPosition) : 0;

  // Calcular posición del indicador
  const radius = 120;
  const needleLength = 100;
  const needleX = Math.cos((angle * Math.PI) / 180) * needleLength;
  const needleY = -Math.sin((angle * Math.PI) / 180) * needleLength;

  // Zonas de puntuación (cuando se muestra el objetivo) con wrap-around
  const renderTargetZones = () => {
    if (!showTarget || targetPosition === undefined) return null;

    // Zonas con bandas de igual ancho (5 unidades cada una)
    // 4 pts: ±2.5 del target (banda de 5 total)
    // 3 pts: 2.5-7.5 del target (banda de 5 a cada lado)
    // 2 pts: 7.5-12.5 del target (banda de 5 a cada lado)
    const zones = [
      { diff: 12.5, color: "#3b4b54", opacity: 1, points: 2 },   // 2 pts - gris oscuro
      { diff: 7.5, color: "#1e6a9e", opacity: 1, points: 3 },    // 3 pts - azul oscuro
      { diff: 2.5, color: "#13a4ec", opacity: 1, points: 4 },    // 4 pts - primary azul
    ];

    const centerX = 150;
    const centerY = 140;

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

  return (
    <div className={cn(
      "flex flex-col items-center gap-4",
      showTarget && "animate-in fade-in zoom-in-95 duration-500"
    )}>
      {/* Labels */}
      {(leftLabel || rightLabel) && (
        <div className="flex w-full items-center justify-between px-2">
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

      {/* Dial SVG */}
      <svg
        ref={svgRef}
        viewBox="0 0 300 160"
        className={cn(
          "w-full max-w-75 select-none touch-none",
          !disabled && "cursor-pointer"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
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

        {/* Aguja/indicador (oculta con hideNeedle) */}
        {!hideNeedle && (
          <>
            <line
              x1="150"
              y1="140"
              x2={150 + needleX}
              y2={140 + needleY}
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className={cn(
                "transition-all duration-100",
                isDragging ? "text-primary" : "text-foreground"
              )}
            />

            {/* Centro del dial */}
            <circle
              cx="150"
              cy="140"
              r="12"
              className={cn(
                "transition-colors",
                isDragging ? "fill-primary" : "fill-muted-foreground"
              )}
            />
            <circle cx="150" cy="140" r="6" className="fill-background" />
          </>
        )}
      </svg>

      {/* Instrucción */}
      {!disabled && (
        <p className="text-center text-sm text-muted-foreground">
          Desliza para ajustar el dial
        </p>
      )}
    </div>
  );
}
