import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface RoomCodeDisplayProps {
  code: string;
  size?: "sm" | "md" | "lg";
}

export function RoomCodeDisplay({ code, size = "md" }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Código copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Error al copiar");
    }
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-muted-foreground">Código de sala</p>
      <div className="flex items-center gap-3">
        <span
          className={`font-mono font-bold tracking-[0.3em] ${textSizes[size]}`}
        >
          {code}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? (
            <Check className="size-5 text-green-500" />
          ) : (
            <Copy className="size-5" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Comparte este código para que otros se unan
      </p>
    </div>
  );
}
