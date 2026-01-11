import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2, Music, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@my-app/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authed/games/hitster/join")({
  component: JoinHitsterRoom,
});

function JoinHitsterRoom() {
  const navigate = useNavigate();
  const joinRoom = useMutation(api.hitster.mutations.joinRoom);

  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Buscar sala cuando el código tiene 5 caracteres
  const roomPreview = useQuery(
    api.hitster.queries.getRoomByCode,
    code.length === 5 ? { code } : "skip"
  );

  const handleCodeChange = (value: string) => {
    // Solo permitir caracteres alfanuméricos y convertir a mayúsculas
    const cleaned = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 5);
    setCode(cleaned);
  };

  const handleJoin = async () => {
    if (code.length !== 5) {
      toast.error("El código debe tener 5 caracteres");
      return;
    }

    if (!roomPreview) {
      toast.error("Sala no encontrada");
      return;
    }

    if (roomPreview.status !== "waiting") {
      toast.error("La sala ya está en juego");
      return;
    }

    setIsJoining(true);

    try {
      const result = await joinRoom({
        code,
      });

      toast.success("Te uniste a la sala");
      navigate({
        to: "/games/hitster/room/$roomId",
        params: { roomId: result.roomId },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al unirse");
      setIsJoining(false);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <Link
          to="/games/hitster"
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-6" />
        </Link>
        <h2 className="flex-1 pr-10 text-center text-lg font-bold leading-tight">
          Unirse a Sala
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          {/* Instructions */}
          <div className="text-center">
            <h3 className="text-xl font-bold">Introduce el código</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pídele el código al anfitrión de la sala
            </p>
          </div>

          {/* Code Input */}
          <div className="flex flex-col gap-4">
            <Input
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="A 3 F 9 Z"
              className="h-16 text-center font-mono text-3xl tracking-[0.5em]"
              maxLength={5}
            />

            {/* Room Preview */}
            {code.length === 5 && (
              <div className="rounded-xl border border-border bg-surface p-4">
                {roomPreview === undefined ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Buscando sala...
                  </div>
                ) : roomPreview === null ? (
                  <p className="text-center text-sm text-destructive">
                    Sala no encontrada
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{roomPreview.name}</span>
                      <span
                        className={
                          roomPreview.status === "waiting"
                            ? "text-xs text-green-500"
                            : "text-xs text-amber-500"
                        }
                      >
                        {roomPreview.status === "waiting"
                          ? "Esperando"
                          : roomPreview.status === "playing"
                            ? "En juego"
                            : "Terminado"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="size-4" />
                        <span>
                          {roomPreview.playerCount}/{roomPreview.maxPlayers}
                        </span>
                      </div>
                      {roomPreview.deckName && (
                        <div className="flex items-center gap-1">
                          <Music className="size-4" />
                          <span>{roomPreview.deckName}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Primer jugador con {roomPreview.cardsToWin} cartas gana
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-background p-6">
        <Button
          onClick={handleJoin}
          disabled={isJoining || code.length !== 5 || !roomPreview}
          size="lg"
          className="h-14 w-full rounded-xl bg-purple-600 text-base hover:bg-purple-700"
        >
          {isJoining ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Uniéndose...
            </>
          ) : (
            "Unirse a Sala"
          )}
        </Button>
      </div>
    </div>
  );
}
