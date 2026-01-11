import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Clock, Disc3, Loader2, Music, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@my-app/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authed/games/hitster/create")({
  component: CreateHitsterRoom,
});

function CreateHitsterRoom() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const createRoom = useMutation(api.hitster.mutations.createRoom);
  const setDeck = useMutation(api.hitster.mutations.setDeck);
  const decks = useQuery(api.hitster.queries.getDecks, { publicOnly: true });

  const [name, setName] = useState(
    `Sala de ${session?.user?.name ?? "Jugador"}`
  );
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [cardsToWin, setCardsToWin] = useState(6);
  const [turnTimeLimit, setTurnTimeLimit] = useState<number | undefined>(
    undefined
  );
  const [isCreating, setIsCreating] = useState(false);

  const cardsOptions = [6, 8, 10];
  const timeOptions = [
    { value: undefined, label: "Sin límite" },
    { value: 30, label: "30s" },
    { value: 60, label: "60s" },
  ];

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Ingresa un nombre para la sala");
      return;
    }

    if (!selectedDeckId) {
      toast.error("Selecciona un deck de canciones");
      return;
    }

    setIsCreating(true);

    try {
      const result = await createRoom({
        name: name.trim(),
        cardsToWin,
        turnTimeLimit,
      });

      // Set the deck
      await setDeck({
        roomId: result.roomId,
        deckId: selectedDeckId as any,
      });

      toast.success(`Sala creada: ${result.code}`);
      navigate({
        to: "/games/hitster/room/$roomId",
        params: { roomId: result.roomId },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear sala");
      setIsCreating(false);
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
          Crear Sala
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          {/* Room Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Nombre de la sala</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi sala de Hitster"
              maxLength={50}
            />
          </div>

          {/* Deck Selector */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Playlist de canciones</label>
            {decks === undefined ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : decks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <Disc3 className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay playlists disponibles.
                </p>
                <p className="text-xs text-muted-foreground">
                  Ejecuta el seed desde el backend.
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {decks.map((deck) => (
                  <button
                    key={deck._id}
                    type="button"
                    onClick={() => setSelectedDeckId(deck._id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all",
                      selectedDeckId === deck._id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg",
                        selectedDeckId === deck._id
                          ? "bg-purple-500 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Music className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{deck.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {deck.songCount > 0
                          ? `${deck.songCount} canciones`
                          : "Canciones se cargarán al iniciar"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cards to Win */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-muted-foreground" />
              <label className="text-sm font-medium">Cartas para ganar</label>
            </div>
            <div className="flex gap-2">
              {cardsOptions.map((cards) => (
                <button
                  key={cards}
                  type="button"
                  onClick={() => setCardsToWin(cards)}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-3 text-center font-semibold transition-all",
                    cardsToWin === cards
                      ? "border-purple-500 bg-purple-500/10 text-purple-400"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  {cards}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              El primer jugador en completar {cardsToWin} cartas en su timeline
              gana
            </p>
          </div>

          {/* Turn Time Limit */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <label className="text-sm font-medium">Tiempo por turno</label>
            </div>
            <div className="flex gap-2">
              {timeOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setTurnTimeLimit(option.value)}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-3 text-center font-semibold transition-all",
                    turnTimeLimit === option.value
                      ? "border-purple-500 bg-purple-500/10 text-purple-400"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <p className="text-center text-sm text-muted-foreground">
            Se generará un código único para que otros puedan unirse a tu sala.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-background p-6">
        <Button
          onClick={handleCreate}
          disabled={isCreating || !selectedDeckId}
          size="lg"
          className="h-14 w-full rounded-xl bg-purple-600 text-base hover:bg-purple-700"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Sala"
          )}
        </Button>
      </div>
    </div>
  );
}
