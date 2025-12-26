import { Trophy } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
}

export function ScoreDisplay({ score, maxScore, size = "md" }: ScoreDisplayProps) {
  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const iconSizes = {
    sm: "size-4",
    md: "size-5",
    lg: "size-8",
  };

  return (
    <div className="flex items-center gap-2">
      <Trophy className={`text-amber-500 ${iconSizes[size]}`} />
      <span className={`font-bold ${textSizes[size]}`}>
        {score}
        {maxScore !== undefined && (
          <span className="text-muted-foreground">/{maxScore}</span>
        )}
      </span>
      <span className="text-sm text-muted-foreground">pts</span>
    </div>
  );
}

interface RoundProgressProps {
  currentRound: number;
  totalRounds: number;
}

export function RoundProgress({ currentRound, totalRounds }: RoundProgressProps) {
  const progress = (currentRound / totalRounds) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-muted-foreground">Progreso</span>
        <span className="font-medium">
          Ronda {currentRound} de {totalRounds}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
