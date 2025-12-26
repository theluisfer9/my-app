import { Lightbulb } from "lucide-react";

interface ClueDisplayProps {
  clue: string;
  size?: "sm" | "md" | "lg";
}

export function ClueDisplay({ clue, size = "md" }: ClueDisplayProps) {
  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  const paddingSizes = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl bg-primary/10 ${paddingSizes[size]}`}
    >
      <div className="flex items-center gap-2 text-primary">
        <Lightbulb className="size-5" />
        <span className="text-sm font-medium uppercase tracking-wider">
          Pista del Psíquico
        </span>
      </div>
      <p className={`text-center font-bold ${textSizes[size]}`}>"{clue}"</p>
    </div>
  );
}
