import { Crown, Radio } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Player {
  _id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  isConnected: boolean;
}

interface PlayerListProps {
  players: Player[];
  psychicId?: string;
  currentUserId?: string;
  compact?: boolean;
}

export function PlayerList({
  players,
  psychicId,
  currentUserId,
  compact = false,
}: PlayerListProps) {
  const connectedPlayers = players.filter((p) => p.isConnected);

  if (compact) {
    return (
      <div className="flex -space-x-2">
        {connectedPlayers.slice(0, 5).map((player) => (
          <PlayerAvatar
            key={player._id}
            player={player}
            isPsychic={player.userId === psychicId}
            isCurrentUser={player.userId === currentUserId}
            size="sm"
          />
        ))}
        {connectedPlayers.length > 5 && (
          <div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
            +{connectedPlayers.length - 5}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {connectedPlayers.map((player) => (
        <div
          key={player._id}
          className={cn(
            "flex items-center gap-3 rounded-xl p-3",
            player.userId === currentUserId
              ? "bg-primary/10"
              : "bg-muted/50"
          )}
        >
          <PlayerAvatar
            player={player}
            isPsychic={player.userId === psychicId}
            isCurrentUser={player.userId === currentUserId}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">
                {player.name}
                {player.userId === currentUserId && (
                  <span className="ml-1 text-muted-foreground">(Tú)</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {player.isHost && (
                <span className="flex items-center gap-1 text-xs text-amber-500">
                  <Crown className="size-3" />
                  Host
                </span>
              )}
              {player.userId === psychicId && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Radio className="size-3" />
                  Psíquico
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface PlayerAvatarProps {
  player: Player;
  isPsychic?: boolean;
  isCurrentUser?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PlayerAvatar({
  player,
  isPsychic,
  isCurrentUser,
  size = "md",
}: PlayerAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "size-8",
    md: "size-10",
    lg: "size-14",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  // Obtener inicial del nombre
  const initial = player.name?.charAt(0)?.toUpperCase() || "?";

  // Mostrar imagen o fallback
  const showImage = player.avatarUrl && !imgError;

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full border-2",
          sizeClasses[size],
          isCurrentUser ? "border-primary" : "border-transparent",
          isPsychic && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          !showImage && "bg-muted"
        )}
      >
        {showImage ? (
          <img
            src={player.avatarUrl}
            alt={player.name}
            className="size-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={cn("font-medium text-muted-foreground", textSizes[size])}>
            {initial}
          </span>
        )}
      </div>
      {player.isHost && (
        <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-white">
          <Crown className="size-2.5" />
        </div>
      )}
      {!player.isConnected && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
          <span className="text-xs text-muted-foreground">...</span>
        </div>
      )}
    </div>
  );
}
