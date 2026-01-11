import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  Disc3,
  Headphones,
  Loader2,
  LogOut,
  Pause,
  Play,
  RotateCcw,
  Send,
  Trophy,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { Id } from "@my-app/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useHitsterGame } from "@/hooks/use-hitster-game";

export const Route = createFileRoute("/_authed/games/hitster/room/$roomId")({
  component: HitsterRoom,
});

function HitsterRoom() {
  const { roomId } = Route.useParams();
  const navigate = useNavigate();
  const game = useHitsterGame(roomId as Id<"hitsterRooms">);

  const handleLeave = async () => {
    await game.leaveRoom();
    navigate({ to: "/games/hitster" });
  };

  if (game.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!game.room || !game.myPlayer) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">Sala no encontrada</p>
        <Link
          to="/games/hitster"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {game.roomStatus === "waiting" && (
        <LobbyScreen game={game} onLeave={handleLeave} />
      )}
      {game.roomStatus === "playing" && game.phase === "listening" && (
        <ListeningScreen game={game} onLeave={handleLeave} />
      )}
      {game.roomStatus === "playing" && game.phase === "placing" && (
        <PlacingScreen game={game} onLeave={handleLeave} />
      )}
      {game.roomStatus === "playing" && game.phase === "bonus" && (
        <BonusScreen game={game} onLeave={handleLeave} />
      )}
      {game.roomStatus === "playing" && game.phase === "result" && (
        <ResultScreen game={game} onLeave={handleLeave} />
      )}
      {game.roomStatus === "finished" && (
        <FinalResultsScreen game={game} onLeave={handleLeave} />
      )}
    </div>
  );
}

// ============ LOBBY SCREEN ============
function LobbyScreen({
  game,
  onLeave,
}: {
  game: ReturnType<typeof useHitsterGame>;
  onLeave: () => void;
}) {
  const [isStarting, setIsStarting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Iniciando...");

  const handleStart = async () => {
    setIsStarting(true);
    try {
      // Si el deck no tiene canciones, mostrar mensaje diferente
      if (game.deck && game.deck.songCount === 0) {
        setLoadingMessage("Cargando canciones de Spotify...");
      }
      await game.startGame();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al iniciar");
      setIsStarting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(game.room?.code ?? "");
    toast.success("Código copiado");
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <button
          onClick={onLeave}
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-6" />
        </button>
        <h2 className="flex-1 pr-10 text-center text-lg font-bold leading-tight">
          {game.room?.name}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          {/* Room Code */}
          <button
            onClick={handleCopyCode}
            className="flex flex-col items-center gap-2 rounded-2xl bg-purple-500/10 p-6"
          >
            <span className="text-xs font-medium uppercase text-muted-foreground">
              Código de sala
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-4xl font-bold tracking-widest text-purple-400">
                {game.room?.code}
              </span>
              <Copy className="size-5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">
              Toca para copiar
            </span>
          </button>

          {/* Deck Info */}
          {game.decks.length > 0 && (
            <div className="flex flex-col gap-2">
              {game.decks.map((d) => (
                <div key={d._id} className="flex items-center gap-3 rounded-xl bg-muted p-3">
                  <Disc3 className="size-6 text-purple-400" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.songCount > 0
                        ? `${d.songCount} canciones`
                        : "Se cargarán al iniciar"}
                    </p>
                  </div>
                </div>
              ))}
              {game.decks.length > 1 && (
                <p className="text-xs text-center text-muted-foreground">
                  {game.decks.reduce((sum, d) => sum + d.songCount, 0)} canciones en total
                </p>
              )}
            </div>
          )}

          {/* Players */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold">
                <Users className="size-5" />
                Jugadores
              </h3>
              <span className="text-sm text-muted-foreground">
                {game.connectedPlayers.length}/8
              </span>
            </div>
            <div className="grid gap-2">
              {game.players.map((player) => (
                <div
                  key={player._id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-3",
                    player.isConnected ? "bg-muted" : "bg-muted/50 opacity-50"
                  )}
                >
                  {player.avatarUrl ? (
                    <img
                      src={player.avatarUrl}
                      alt={player.name}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-purple-500/20">
                      <span className="font-medium text-purple-400">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="flex-1 font-medium">{player.name}</span>
                  {player.isHost && (
                    <Crown className="size-4 text-amber-500" />
                  )}
                  {player._id === game.myPlayer?._id && (
                    <span className="text-xs text-muted-foreground">(tú)</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Game Settings */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-lg bg-muted p-3 text-sm">
            <span className="text-muted-foreground">
              Meta: {game.room?.cardsToWin} cartas
            </span>
            {game.room?.turnTimeLimit && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {game.room.turnTimeLimit}s por turno
                </span>
              </>
            )}
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {game.room?.gameMode === "group" ? "Grupal" : "Remoto"}
            </span>
          </div>

          {game.connectedPlayers.length < 2 && (
            <p className="text-center text-sm text-muted-foreground">
              Se necesitan al menos 2 jugadores para iniciar
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      {game.isHost ? (
        <div className="border-t border-border bg-background p-6">
          <Button
            onClick={handleStart}
            disabled={isStarting || game.connectedPlayers.length < 2}
            size="lg"
            className="h-14 w-full rounded-xl bg-purple-600 text-base hover:bg-purple-700"
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                {loadingMessage}
              </>
            ) : (
              <>
                <Play className="mr-2 size-5" />
                Iniciar Juego
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="border-t border-border bg-background p-6">
          <p className="text-center text-muted-foreground">
            Esperando a que el anfitrión inicie el juego...
          </p>
        </div>
      )}
    </>
  );
}

// ============ LISTENING SCREEN ============
function ListeningScreen({
  game,
  onLeave,
}: {
  game: ReturnType<typeof useHitsterGame>;
  onLeave: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleAdvance = async () => {
    setIsAdvancing(true);
    try {
      await game.advanceToPlacing();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
      setIsAdvancing(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  // Determinar si debo reproducir audio
  const shouldPlayAudio =
    game.room?.gameMode === "group" ? game.isMyTurn : true;

  // Auto-play when song loads (only if should play)
  useEffect(() => {
    if (game.currentSong?.previewUrl && audioRef.current && shouldPlayAudio) {
      audioRef.current.play().catch(() => {
        // Autoplay might be blocked
      });
    }
  }, [game.currentSong?.previewUrl, shouldPlayAudio]);

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Headphones className="size-5 text-purple-400" />
          <span className="text-sm font-medium">
            {game.isMyTurn ? "Tu turno" : `Turno de ${game.currentTurn?.playerName}`}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {game.cardsRemaining} cartas
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        {/* En modo grupal y no es tu turno, mostrar solo espera */}
        {game.room?.gameMode === "group" && !game.isMyTurn ? (
          <>
            <div className="flex size-32 items-center justify-center rounded-full bg-muted">
              <Headphones className="size-16 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                {game.currentTurn?.playerName} está escuchando
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Modo grupal: solo el jugador activo escucha la canción
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Album Art */}
            <div className="relative">
              <div
                className={cn(
                  "size-48 overflow-hidden rounded-2xl bg-purple-500/20 shadow-xl",
                  isPlaying && "animate-pulse"
                )}
              >
                {game.currentSong?.coverUrl ? (
                  <img
                    src={game.currentSong.coverUrl}
                    alt="Album cover"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Disc3 className="size-24 text-purple-400" />
                  </div>
                )}
              </div>
              {isPlaying && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                  <Volume2 className="size-6 animate-bounce text-purple-400" />
                </div>
              )}
            </div>

            {/* Audio Player */}
            <div className="flex w-full max-w-xs flex-col items-center gap-4">
              {/* Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls */}
              <button
                onClick={handlePlayPause}
                className="flex size-16 items-center justify-center rounded-full bg-purple-500 text-white transition-transform active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="size-8" />
                ) : (
                  <Play className="size-8 translate-x-0.5" />
                )}
              </button>

              {/* Hidden audio element */}
              <audio ref={audioRef} src={game.currentSong?.previewUrl} />
            </div>

            {/* Instructions */}
            <p className="text-center text-sm text-muted-foreground">
              {game.isMyTurn
                ? "Escucha la canción y decide dónde colocarla en tu timeline"
                : "Escucha la canción mientras esperas tu turno"}
            </p>
          </>
        )}
      </div>

      {/* Footer */}
      {game.isMyTurn && (
        <div className="border-t border-border bg-background p-6">
          <Button
            onClick={handleAdvance}
            disabled={isAdvancing}
            size="lg"
            className="h-14 w-full rounded-xl bg-purple-600 text-base hover:bg-purple-700"
          >
            {isAdvancing ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Avanzando...
              </>
            ) : (
              <>
                Colocar en Timeline
                <ArrowRight className="ml-2 size-5" />
              </>
            )}
          </Button>
        </div>
      )}

      {!game.isMyTurn && (
        <div className="border-t border-border bg-background p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>{game.currentTurn?.playerName} está escuchando...</span>
          </div>
        </div>
      )}
    </>
  );
}

// ============ PLACING SCREEN ============
function PlacingScreen({
  game,
  onLeave,
}: {
  game: ReturnType<typeof useHitsterGame>;
  onLeave: () => void;
}) {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  // Timeline del jugador actual del turno
  const timeline = game.isMyTurn ? game.myTimeline : game.activeTimeline;

  const handlePlace = async () => {
    if (selectedPosition === null) {
      toast.error("Selecciona una posición");
      return;
    }

    setIsPlacing(true);
    try {
      await game.placeCard(selectedPosition);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al colocar");
      setIsPlacing(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {game.isMyTurn ? "Tu timeline" : `Timeline de ${game.currentTurn?.playerName}`}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {timeline.length} cartas
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-lg flex-col gap-4">
          {/* Instructions */}
          <div className="text-center">
            <h3 className="text-lg font-bold">
              {game.isMyTurn
                ? "¿Dónde va esta canción?"
                : `${game.currentTurn?.playerName} está eligiendo...`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {game.isMyTurn
                ? "Toca entre las cartas para colocarla"
                : "Mira cómo construye su timeline"}
            </p>
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-2">
            {/* Position before first card */}
            {game.isMyTurn && (
              <button
                onClick={() => setSelectedPosition(0)}
                className={cn(
                  "mx-auto flex h-12 w-full max-w-xs items-center justify-center rounded-xl border-2 border-dashed transition-all",
                  selectedPosition === 0
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-border hover:border-purple-400"
                )}
              >
                <span className="text-sm text-muted-foreground">
                  {selectedPosition === 0 ? "Aquí" : "Más antigua"}
                </span>
              </button>
            )}

            {/* Cards in timeline */}
            {timeline.map((item, index) => (
              <div key={item.songId} className="flex flex-col gap-2">
                {/* Card */}
                <div className={cn(
                  "flex items-center gap-3 rounded-xl p-3",
                  item.isInitial
                    ? "bg-purple-500/10 ring-1 ring-purple-500/30"
                    : "bg-muted"
                )}>
                  {item.coverUrl && (
                    <img
                      src={item.coverUrl}
                      alt=""
                      className="size-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{item.name}</p>
                      {item.isInitial && (
                        <span className="shrink-0 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                          BASE
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.artistName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-purple-400">
                      {item.year}
                    </span>
                  </div>
                </div>

                {/* Position after this card */}
                {game.isMyTurn && (
                  <button
                    onClick={() => setSelectedPosition(index + 1)}
                    className={cn(
                      "mx-auto flex h-12 w-full max-w-xs items-center justify-center rounded-xl border-2 border-dashed transition-all",
                      selectedPosition === index + 1
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-border hover:border-purple-400"
                    )}
                  >
                    <span className="text-sm text-muted-foreground">
                      {selectedPosition === index + 1
                        ? "Aquí"
                        : index === timeline.length - 1
                          ? "Más reciente"
                          : "Entre estas"}
                    </span>
                  </button>
                )}
              </div>
            ))}

            {/* Empty timeline state */}
            {timeline.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <Disc3 className="size-12 text-muted-foreground" />
                <p className="text-muted-foreground">Timeline vacío</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {game.isMyTurn ? (
        <div className="border-t border-border bg-background p-6">
          <Button
            onClick={handlePlace}
            disabled={isPlacing || selectedPosition === null}
            size="lg"
            className="h-14 w-full rounded-xl bg-purple-600 text-base hover:bg-purple-700"
          >
            {isPlacing ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Colocando...
              </>
            ) : (
              "Confirmar Posición"
            )}
          </Button>
        </div>
      ) : (
        <div className="border-t border-border bg-background p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>{game.currentTurn?.playerName} está eligiendo...</span>
          </div>
        </div>
      )}
    </>
  );
}

// ============ BONUS SCREEN ============
function BonusScreen({
  game,
  onLeave,
}: {
  game: ReturnType<typeof useHitsterGame>;
  onLeave: () => void;
}) {
  const [artistGuess, setArtistGuess] = useState("");
  const [songGuess, setSongGuess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await game.submitBonus(artistGuess.trim(), songGuess.trim());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-center border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Check className="size-5 text-green-500" />
          <span className="text-sm font-medium text-green-500">
            ¡Posición correcta! +1 punto
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        {game.isMyTurn ? (
          <>
            {/* Title */}
            <div className="text-center">
              <h2 className="text-2xl font-bold">¡Bonus!</h2>
              <p className="mt-1 text-muted-foreground">
                Adivina el artista y/o canción para puntos extra
              </p>
            </div>

            {/* Album cover hint */}
            <div className="size-32 overflow-hidden rounded-2xl bg-purple-500/20">
              {game.currentSong?.coverUrl ? (
                <img
                  src={game.currentSong.coverUrl}
                  alt="Album cover"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Disc3 className="size-16 text-purple-400" />
                </div>
              )}
            </div>

            {/* Inputs */}
            <div className="flex w-full max-w-xs flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">¿Quién canta?</label>
                <Input
                  value={artistGuess}
                  onChange={(e) => setArtistGuess(e.target.value)}
                  placeholder="Nombre del artista..."
                  className="h-12"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">¿Cómo se llama?</label>
                <Input
                  value={songGuess}
                  onChange={(e) => setSongGuess(e.target.value)}
                  placeholder="Nombre de la canción..."
                  className="h-12"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-12 animate-spin text-purple-400" />
            <p className="text-center text-muted-foreground">
              {game.currentTurn?.playerName} está adivinando artista y canción...
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {game.isMyTurn && (
        <div className="border-t border-border bg-background p-6">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="h-14 w-full rounded-xl bg-purple-600 text-base hover:bg-purple-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 size-5" />
                Enviar Respuestas
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}

// ============ RESULT SCREEN ============
function ResultScreen({
  game,
  onLeave,
}: {
  game: ReturnType<typeof useHitsterGame>;
  onLeave: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleNextTurn = async () => {
    setIsLoading(true);
    try {
      await game.nextTurn();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
      setIsLoading(false);
    }
  };

  const turn = game.currentTurn;
  const song = game.currentSong;
  const isCorrect = turn?.isCorrect;

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-center border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <span className="text-sm font-medium">Resultado del turno</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-md flex-col items-center gap-6">
          {/* Result indicator */}
          <div
            className={cn(
              "flex size-20 items-center justify-center rounded-full",
              isCorrect ? "bg-green-500/20" : "bg-red-500/20"
            )}
          >
            {isCorrect ? (
              <Check className="size-10 text-green-500" />
            ) : (
              <X className="size-10 text-red-500" />
            )}
          </div>

          {/* Message */}
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {isCorrect ? "¡Correcto!" : "Incorrecto"}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {isCorrect
                ? `+${turn?.pointsEarned ?? 1} ${(turn?.pointsEarned ?? 1) === 1 ? "punto" : "puntos"}`
                : "La carta no se agrega al timeline"}
            </p>
          </div>

          {/* Song reveal */}
          {song && (
            <div className="flex w-full flex-col items-center gap-4 rounded-2xl bg-muted p-6">
              {song.coverUrl && (
                <img
                  src={song.coverUrl}
                  alt="Album cover"
                  className="size-32 rounded-xl object-cover shadow-lg"
                />
              )}
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">
                  {song.releaseYear}
                </p>
                <p className="mt-2 text-lg font-semibold">{song.name}</p>
                <p className="text-muted-foreground">{song.artistName}</p>
              </div>
            </div>
          )}

          {/* Bonus results (if applicable) */}
          {isCorrect && (turn?.artistCorrect !== undefined || turn?.songCorrect !== undefined) && (
            <div className="flex w-full flex-col gap-3 rounded-xl border border-border p-4">
              <h4 className="text-center text-sm font-medium text-muted-foreground">
                Bonus
              </h4>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2">
                  {turn?.artistCorrect ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <X className="size-4 text-red-500" />
                  )}
                  <span className="text-sm">Artista</span>
                </div>
                <div className="flex items-center gap-2">
                  {turn?.songCorrect ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <X className="size-4 text-red-500" />
                  )}
                  <span className="text-sm">Canción</span>
                </div>
              </div>
            </div>
          )}

          {/* Scores */}
          <div className="w-full rounded-xl border border-border p-4">
            <h4 className="mb-3 text-center text-sm font-medium text-muted-foreground">
              Puntajes
            </h4>
            <div className="flex flex-col gap-2">
              {game.rankedPlayers.map((player, index) => (
                <div
                  key={player._id}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2",
                    player._id === game.myPlayer?._id
                      ? "bg-purple-500/10"
                      : "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-medium">{player.name}</span>
                    {player._id === game.currentPlayer?._id && (
                      <span className="text-xs text-purple-400">
                        (turno actual)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{player.score}</span>
                    <span className="text-xs text-muted-foreground">
                      ({player.timeline.length} cartas)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-background p-6">
        <Button
          onClick={handleNextTurn}
          disabled={isLoading}
          size="lg"
          className="h-14 w-full rounded-xl bg-purple-600 text-base hover:bg-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              Siguiente Turno
              <ArrowRight className="ml-2 size-5" />
            </>
          )}
        </Button>
      </div>
    </>
  );
}

// ============ FINAL RESULTS SCREEN ============
function FinalResultsScreen({
  game,
  onLeave,
}: {
  game: ReturnType<typeof useHitsterGame>;
  onLeave: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayAgain = async () => {
    setIsLoading(true);
    try {
      await game.playAgain();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
      setIsLoading(false);
    }
  };

  const winner = game.rankedPlayers[0];
  const myRank =
    game.rankedPlayers.findIndex((p) => p._id === game.myPlayer?._id) + 1;

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-center border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <h2 className="text-lg font-bold">Resultados Finales</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          {/* Winner announcement */}
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent p-6">
            <div className="flex size-20 items-center justify-center rounded-full bg-amber-500/20">
              <Trophy className="size-10 text-amber-500" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ganador</p>
              <h3 className="text-2xl font-bold">{winner?.name ?? "Sin ganador"}</h3>
              <p className="mt-1 text-3xl font-bold text-amber-500">
                {winner?.score ?? 0} puntos
              </p>
              <p className="text-sm text-muted-foreground">
                {winner?.timeline.length ?? 0} cartas en timeline
              </p>
            </div>
          </div>

          {/* My position */}
          {myRank > 1 && (
            <div className="flex items-center justify-between rounded-xl bg-purple-500/10 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Tu posición</p>
                <p className="text-lg font-bold">
                  #{myRank} de {game.rankedPlayers.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tu puntaje</p>
                <p className="text-lg font-bold">
                  {game.myPlayer?.score ?? 0} pts
                </p>
              </div>
            </div>
          )}

          {/* Ranking */}
          <div className="rounded-xl border border-border p-4">
            <h4 className="mb-4 text-center font-semibold">Ranking Final</h4>
            <div className="flex flex-col gap-2">
              {game.rankedPlayers.map((player, index) => (
                <div
                  key={player._id}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-4 py-3",
                    player._id === game.myPlayer?._id
                      ? "bg-purple-500/10 ring-2 ring-purple-500"
                      : index < 3
                        ? "bg-muted"
                        : "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-lg font-bold",
                        index === 0
                          ? "text-amber-500"
                          : index === 1
                            ? "text-slate-400"
                            : index === 2
                              ? "text-amber-700"
                              : "text-muted-foreground"
                      )}
                    >
                      #{index + 1}
                    </span>
                    {player.avatarUrl ? (
                      <img
                        src={player.avatarUrl}
                        alt={player.name}
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted-foreground/20">
                        <span className="text-sm font-medium">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-medium">{player.name}</span>
                    {player._id === game.myPlayer?._id && (
                      <span className="text-xs text-muted-foreground">(tú)</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "font-bold",
                        index === 0
                          ? "text-amber-500"
                          : index === 1
                            ? "text-slate-400"
                            : index === 2
                              ? "text-amber-700"
                              : ""
                      )}
                    >
                      {player.score} pts
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {player.timeline.length} cartas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-border bg-background p-6">
        {game.isHost && (
          <Button
            onClick={handlePlayAgain}
            disabled={isLoading}
            size="lg"
            className="h-14 w-full rounded-xl bg-purple-600 text-base hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Reiniciando...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 size-5" />
                Jugar de nuevo
              </>
            )}
          </Button>
        )}
        <Button
          onClick={onLeave}
          variant="outline"
          size="lg"
          className="h-14 w-full rounded-xl text-base"
        >
          <LogOut className="mr-2 size-5" />
          Volver al Lobby
        </Button>
      </div>
    </>
  );
}
