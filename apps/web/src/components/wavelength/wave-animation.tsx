import { cn } from "@/lib/utils";

interface WaveAnimationProps {
  className?: string;
}

export function WaveAnimation({ className }: WaveAnimationProps) {
  // Generar alturas fijas para evitar re-renders con Math.random()
  const bars = Array.from({ length: 40 }, (_, i) => {
    const centerOffset = Math.abs(i - 20) / 20;
    return (1 - centerOffset * 0.8) * 45 + 5;
  });

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 320 160"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Líneas verticales de ondas de sonido */}
        <g filter="url(#glow)">
          {bars.map((height, i) => {
            const x = 20 + i * 7;
            return (
              <rect
                key={i}
                x={x - 1.5}
                y={80 - height}
                width={3}
                height={height * 2}
                rx={1.5}
                fill="url(#waveGradient)"
                className="animate-wave"
                style={{
                  animationDelay: `${i * 0.03}s`,
                }}
              />
            );
          })}
        </g>

        <style>
          {`
            @keyframes waveAnim {
              0%, 100% {
                transform: scaleY(0.5);
                opacity: 0.5;
              }
              50% {
                transform: scaleY(1);
                opacity: 1;
              }
            }
            .animate-wave {
              animation: waveAnim 1.2s ease-in-out infinite;
              transform-origin: center;
              transform-box: fill-box;
            }
          `}
        </style>
      </svg>
    </div>
  );
}
