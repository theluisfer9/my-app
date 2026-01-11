import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Crown,
  Loader2,
  LogOut,
  Play,
  Radio,
  RotateCcw,
  Send,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { Id } from "@my-app/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClueDisplay } from "@/components/wavelength/clue-display";
import { MultiPlayerDial } from "@/components/wavelength/multi-player-dial";
import { PlayerList } from "@/components/wavelength/player-list";
import { RoomCodeDisplay } from "@/components/wavelength/room-code-display";
import { RoundProgress, ScoreDisplay } from "@/components/wavelength/score-display";
import { SpectrumDial } from "@/components/wavelength/spectrum-dial";
import { useWavelengthGame } from "@/hooks/use-wavelength-game";

export const Route = createFileRoute("/_authed/games/wavelength/room/$roomId")({
  component: GameRoom,
});

function GameRoom() {
  const { roomId } = Route.useParams();
  const navigate = useNavigate();
  const game = useWavelengthGame(roomId as Id<"rooms">);

  const handleLeave = async () => {
    await game.leaveRoom();
    navigate({ to: "/games/wavelength" });
  };

  if (game.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!game.room || !game.myPlayer) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">Sala no encontrada</p>
        <Link
          to="/games/wavelength"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Render based on game state */}
      {game.roomStatus === "waiting" && (
        <LobbyScreen game={game} onLeave={handleLeave} />
      )}
      {game.roomStatus === "playing" && game.roundStatus === "psychic_turn" && (
        game.isPsychic ? (
          <PsychicTurnScreen game={game} onLeave={handleLeave} />
        ) : (
          <WaitingForClueScreen game={game} onLeave={handleLeave} />
        )
      )}
      {game.roomStatus === "playing" && game.roundStatus === "guessing" && (
        <GuessingScreen game={game} onLeave={handleLeave} />
      )}
      {game.roomStatus === "playing" && game.roundStatus === "results" && (
        <RoundResultsScreen game={game} onLeave={handleLeave} />
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
  game: ReturnType<typeof useWavelengthGame>;
  onLeave: () => void;
}) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await game.startGame();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al iniciar");
      setIsStarting(false);
    }
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
          <RoomCodeDisplay code={game.room?.code ?? ""} />

          {/* Players */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold">
                <Users className="size-5" />
                Jugadores en sala
              </h3>
              <span className="text-sm text-muted-foreground">
                {game.connectedPlayers.length}/12
              </span>
            </div>
            <PlayerList
              players={game.players}
              currentUserId={game.myPlayer?.userId}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2">
            {/* Modo de juego */}
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-3">
              <span className="text-sm text-muted-foreground">Modo:</span>
              <span className="font-semibold">
                {game.gameMode === "teams" ? "Por Equipos" : "Individual"}
              </span>
              <span className="text-sm text-muted-foreground">
                • {game.room?.totalRounds ?? 5} rondas
              </span>
            </div>

            {/* Advertencias según modo */}
            {game.connectedPlayers.length < 2 && (
              <p className="text-center text-sm text-muted-foreground">
                Se necesitan al menos 2 jugadores para iniciar
              </p>
            )}
            {game.gameMode === "teams" && game.connectedPlayers.length < 4 && game.connectedPlayers.length >= 2 && (
              <p className="text-center text-sm text-amber-500">
                El modo por equipos requiere al menos 4 jugadores
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {game.isHost && (
        <div className="border-t border-border bg-background p-6">
          <Button
            onClick={handleStart}
            disabled={
              isStarting ||
              game.connectedPlayers.length < 2 ||
              (game.gameMode === "teams" && game.connectedPlayers.length < 4)
            }
            size="lg"
            className="h-14 w-full rounded-xl text-base"
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Play className="mr-2 size-5" />
                Iniciar Juego
              </>
            )}
          </Button>
        </div>
      )}

      {!game.isHost && (
        <div className="border-t border-border bg-background p-6">
          <p className="text-center text-muted-foreground">
            Esperando a que el anfitrión inicie el juego...
          </p>
        </div>
      )}
    </>
  );
}

// ============ PSYCHIC TURN SCREEN ============
function PsychicTurnScreen({
  game,
  onLeave,
}: {
  game: ReturnType<typeof useWavelengthGame>;
  onLeave: () => void;
}) {
  const [clue, setClue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!clue.trim()) {
      toast.error("Escribe una pista");
      return;
    }

    setIsSubmitting(true);
    try {
      await game.submitClue(clue.trim());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al enviar pista");
      setIsSubmitting(false);
    }
  };

  const targetPosition = game.currentRound?.targetPosition ?? 50;

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Radio className="size-5 text-primary" />
          <span className="text-sm font-medium">Tu Turno</span>
        </div>
        <ScoreDisplay score={game.room?.totalScore ?? 0} size="sm" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold">¡Es tu turno, Psíquico!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configura el espectro oculto y da una pista para que tu equipo
              adivine dónde cae el objetivo.{" "}
              <span className="text-destructive">No muestres tu pantalla.</span>
            </p>
          </div>

          {/* Spectrum Dial with Target (sin aguja) */}
          <div className="w-full max-w-sm mx-auto">
            <SpectrumDial
              value={targetPosition}
              disabled
              showTarget
              targetPosition={targetPosition}
              leftLabel={game.spectrum?.leftLabel}
              rightLabel={game.spectrum?.rightLabel}
              hideNeedle
            />
          </div>

          {/* Clue Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tu palabra clave</label>
            <Input
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              placeholder="Escribe tu pista aquí..."
              maxLength={50}
              className="h-14 text-lg"
            />
            <p className="text-xs text-muted-foreground">
              La pista debe ser una única idea relacionada con la posición del
              objetivo.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-background p-6">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !clue.trim()}
          size="lg"
          className="h-14 w-full rounded-xl text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 size-5" />
              Enviar Pista
            </>
          )}
        </Button>
      </div>
    </>
  );
}

// ============ WAITING FOR CLUE SCREEN ============
function WaitingForClueScreen({
  game,
  onLeave,
}: {
  game: ReturnType<typeof useWavelengthGame>;
  onLeave: () => void;
}) {
  const psychic = game.players.find(
    (p) => p.userId === game.currentRound?.psychicId
  );

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <RoundProgress
          currentRound={game.room?.currentRound ?? 1}
          totalRounds={game.room?.totalRounds ?? 5}
        />
        <ScoreDisplay score={game.room?.totalScore ?? 0} size="sm" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        {/* Spectrum Labels */}
        <div className="flex w-full max-w-xs items-center justify-between rounded-xl bg-muted p-4">
          <span className="font-medium">{game.spectrum?.leftLabel}</span>
          <span className="text-muted-foreground">↔</span>
          <span className="font-medium">{game.spectrum?.rightLabel}</span>
        </div>

        {/* Waiting indicator */}
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-lg font-medium">Esperando pista...</p>
            <p className="text-sm text-muted-foreground">
              {psychic?.name ?? "El psíquico"} está pensando
            </p>
          </div>
        </div>

        {/* Players */}
        <div className="mt-4">
          <PlayerList
            players={game.players}
            psychicId={game.currentRound?.psychicId}
            currentUserId={game.myPlayer?.userId}
            compact
          />
        </div>
      </div>
    </>
  );
}

// ============ GUESSING SCREEN ============
function GuessingScreen({
  game,
  onLeave,
}: {
  game: ReturnType<typeof useWavelengthGame>;
  onLeave: () => void;
}) {
  const [guess, setGuess] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef<number>(50);

  // Verificar si ya confirmó
  const hasConfirmed = game.myGuess?.confirmed ?? false;

  // Enviar posición al servidor con debounce para evitar spam
  const handleGuessChange = (newGuess: number) => {
    // Actualizar estado local inmediatamente para UI responsiva
    setGuess(newGuess);

    // Debounce para enviar al servidor (150ms)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      // Solo enviar si el valor cambió significativamente (> 1 unidad)
      if (Math.abs(newGuess - lastSentRef.current) >= 1) {
        lastSentRef.current = newGuess;
        game.updateGuessPosition(newGuess);
      }
    }, 150);
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await game.submitGuess(guess);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al enviar");
      setIsSubmitting(false);
    }
  };

  const targetPosition = game.currentRound?.targetPosition ?? 50;

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <RoundProgress
          currentRound={game.room?.currentRound ?? 1}
          totalRounds={game.room?.totalRounds ?? 5}
        />
        {game.gameMode === "teams" ? (
          <div className="flex items-center gap-3 text-sm">
            <span className={`font-bold ${game.myTeam === 1 ? "text-primary" : ""}`}>
              E1: {game.team1Score}
            </span>
            <span className="text-muted-foreground">vs</span>
            <span className={`font-bold ${game.myTeam === 2 ? "text-primary" : ""}`}>
              E2: {game.team2Score}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Tu puntaje:</span>
            <span className="font-bold">{game.myPlayer?.score ?? 0}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          {/* Clue */}
          <ClueDisplay clue={game.currentRound?.clue ?? ""} />

          {game.isPsychic ? (
            // Vista del psíquico: ve las zonas de puntuación y las agujas de todos
            <>
              <MultiPlayerDial
                playerGuesses={game.playerGuesses}
                currentUserId={game.myPlayer?.userId}
                showTarget
                targetPosition={targetPosition}
                leftLabel={game.spectrum?.leftLabel}
                rightLabel={game.spectrum?.rightLabel}
              />
              <div className="flex flex-col items-center gap-2 rounded-xl bg-muted p-4">
                <p className="text-center text-sm text-muted-foreground">
                  Observa cómo el equipo está adivinando...
                </p>
                {/* Indicador de quiénes han confirmado */}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  {game.playerGuesses.map((g) => (
                    <div
                      key={g.userId}
                      className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs ${
                        g.confirmed ? "bg-green-500/20 text-green-400" : "bg-muted"
                      }`}
                    >
                      <span className="max-w-16 truncate">
                        {g.player?.name || "Jugador"}
                      </span>
                      {g.confirmed && <span>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Vista del jugador: puede mover su dial
            <>
              <SpectrumDial
                value={guess}
                onChange={hasConfirmed ? undefined : handleGuessChange}
                disabled={hasConfirmed}
                leftLabel={game.spectrum?.leftLabel}
                rightLabel={game.spectrum?.rightLabel}
              />

              {/* Mostrar estado de otros jugadores */}
              {game.playerGuesses.length > 0 && (
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="mb-2 text-center text-xs text-muted-foreground">
                    Esperando a que todos confirmen...
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {game.playerGuesses
                      .filter((g) => g.userId !== game.myPlayer?.userId)
                      .map((g) => (
                        <div
                          key={g.userId}
                          className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs ${
                            g.confirmed ? "bg-green-500/20 text-green-400" : "bg-background"
                          }`}
                        >
                          <span className="max-w-16 truncate">
                            {g.player?.name || "Jugador"}
                          </span>
                          {g.confirmed && <span>✓</span>}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer - Solo muestra botón si no es el psíquico */}
      {!game.isPsychic && (
        <div className="border-t border-border bg-background p-6">
          {hasConfirmed ? (
            <div className="flex h-14 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
              <span className="mr-2">✓</span>
              Esperando a los demás jugadores...
            </div>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
              className="h-14 w-full rounded-xl text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Confirmando...
                </>
              ) : (
                "Confirmar Decisión"
              )}
            </Button>
          )}
        </div>
      )}
    </>
  );
}

// ============ ROUND RESULTS SCREEN ============
function RoundResultsScreen({
  game,
  onLeave,
}: {
  game: ReturnType<typeof useWavelengthGame>;
  onLeave: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleNextRound = async () => {
    setIsLoading(true);
    try {
      await game.nextRound();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
      setIsLoading(false);
    }
  };

  const round = game.currentRound;
  const isLastRound = (game.room?.currentRound ?? 0) >= (game.room?.totalRounds ?? 5);

  // Puntuación individual del jugador actual
  const myGuess = game.myGuess;
  const myPoints = game.isPsychic
    ? Math.round(
        (game.playerGuesses.reduce((sum, g) => sum + (g.pointsEarned ?? 0), 0) /
          Math.max(1, game.playerGuesses.length))
      )
    : (myGuess?.pointsEarned ?? 0);

  // Mensaje según puntos
  const getPointsMessage = (pts: number) => {
    if (pts === 4) return "¡Perfecto!";
    if (pts === 3) return "¡Casi Perfecto!";
    if (pts === 2) return "¡Buen intento!";
    return "Sigue intentando";
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <RoundProgress
          currentRound={game.room?.currentRound ?? 1}
          totalRounds={game.room?.totalRounds ?? 5}
        />
        {game.gameMode === "teams" ? (
          <div className="flex items-center gap-3 text-sm">
            <span className={`font-bold ${game.myTeam === 1 ? "text-primary" : ""}`}>
              E1: {game.team1Score}
            </span>
            <span className="text-muted-foreground">vs</span>
            <span className={`font-bold ${game.myTeam === 2 ? "text-primary" : ""}`}>
              E2: {game.team2Score}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Tu puntaje:</span>
            <span className="font-bold">{game.myPlayer?.score ?? 0}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          {/* Clue */}
          <ClueDisplay clue={round?.clue ?? ""} />

          {/* Dial con resultado - muestra todas las agujas */}
          {round && game.spectrum && (
            <MultiPlayerDial
              playerGuesses={game.playerGuesses}
              currentUserId={game.myPlayer?.userId}
              showTarget
              targetPosition={round.targetPosition}
              leftLabel={game.spectrum.leftLabel}
              rightLabel={game.spectrum.rightLabel}
            />
          )}

          {/* Puntuación individual de la ronda */}
          <div className="flex flex-col items-center gap-2 rounded-xl bg-muted p-6">
            <span className="text-4xl font-bold">+{myPoints}</span>
            <span className="text-lg font-medium text-muted-foreground">
              {game.isPsychic ? "Puntos como Psíquico" : getPointsMessage(myPoints)}
            </span>
          </div>

          {/* Mini ranking de la ronda */}
          <div className="rounded-xl border border-border p-4">
            <h4 className="mb-3 text-center text-sm font-medium text-muted-foreground">
              Resultados de la ronda
            </h4>
            <div className="flex flex-col gap-2">
              {game.playerGuesses
                .sort((a, b) => (b.pointsEarned ?? 0) - (a.pointsEarned ?? 0))
                .map((guess, index) => (
                  <div
                    key={guess.userId}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                      guess.userId === game.myPlayer?.userId
                        ? "bg-primary/10"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="text-sm font-medium">
                        {guess.player?.name ?? "Jugador"}
                      </span>
                    </div>
                    <span className="font-bold text-primary">
                      +{guess.pointsEarned ?? 0}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-background p-6">
        <Button
          onClick={handleNextRound}
          disabled={isLoading}
          size="lg"
          className="h-14 w-full rounded-xl text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Cargando...
            </>
          ) : isLastRound ? (
            <>
              <Trophy className="mr-2 size-5" />
              Ver Resultados Finales
            </>
          ) : (
            <>
              Siguiente Ronda
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
  game: ReturnType<typeof useWavelengthGame>;
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

  const rankedPlayers = game.rankedPlayers;
  const winner = rankedPlayers[0];
  const myRank = rankedPlayers.findIndex((p) => p.userId === game.myPlayer?.userId) + 1;
  const myScore = game.myPlayer?.score ?? 0;

  // Colores para el podio
  const podiumColors = ["text-amber-500", "text-slate-400", "text-amber-700"];

  // Modo equipos
  const isTeamsMode = game.gameMode === "teams";
  const winningTeam = game.team1Score > game.team2Score ? 1 : game.team2Score > game.team1Score ? 2 : 0;

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-center border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <h2 className="text-lg font-bold">Resultados Finales</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          {isTeamsMode ? (
            // Vista por equipos
            <>
              {/* Equipo ganador */}
              <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent p-6">
                <div className="flex size-20 items-center justify-center rounded-full bg-amber-500/20">
                  <Trophy className="size-10 text-amber-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Equipo Ganador</p>
                  <h3 className="text-2xl font-bold">
                    {winningTeam === 0
                      ? "¡Empate!"
                      : `Equipo ${winningTeam}`}
                  </h3>
                  <p className="mt-1 text-3xl font-bold text-amber-500">
                    {Math.max(game.team1Score, game.team2Score)} pts
                  </p>
                </div>
              </div>

              {/* Puntuación de equipos */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 ${
                    winningTeam === 1
                      ? "bg-green-500/20 ring-2 ring-green-500"
                      : "bg-muted"
                  }`}
                >
                  <span className="text-sm font-medium">Equipo 1</span>
                  <span className="text-2xl font-bold">{game.team1Score}</span>
                  <div className="flex flex-wrap justify-center gap-1">
                    {game.team1Players.map((p) => (
                      <span
                        key={p.userId}
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.userId === game.myPlayer?.userId
                            ? "bg-primary text-primary-foreground"
                            : "bg-background"
                        }`}
                      >
                        {p.name.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 ${
                    winningTeam === 2
                      ? "bg-green-500/20 ring-2 ring-green-500"
                      : "bg-muted"
                  }`}
                >
                  <span className="text-sm font-medium">Equipo 2</span>
                  <span className="text-2xl font-bold">{game.team2Score}</span>
                  <div className="flex flex-wrap justify-center gap-1">
                    {game.team2Players.map((p) => (
                      <span
                        key={p.userId}
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.userId === game.myPlayer?.userId
                            ? "bg-primary text-primary-foreground"
                            : "bg-background"
                        }`}
                      >
                        {p.name.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tu resultado */}
              <div className="flex items-center justify-between rounded-xl bg-primary/10 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tu equipo</p>
                  <p className="text-lg font-bold">
                    Equipo {game.myTeam}{" "}
                    {game.myTeam === winningTeam && winningTeam !== 0 && (
                      <span className="text-green-500">¡Ganaste!</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Tu aporte</p>
                  <p className="text-lg font-bold">{myScore} pts</p>
                </div>
              </div>
            </>
          ) : (
            // Vista individual
            <>
              {/* Winner announcement */}
              <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent p-6">
                <div className="flex size-20 items-center justify-center rounded-full bg-amber-500/20">
                  <Trophy className="size-10 text-amber-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Ganador</p>
                  <h3 className="text-2xl font-bold">{winner?.name ?? "Sin ganador"}</h3>
                  <p className="mt-1 text-3xl font-bold text-amber-500">
                    {winner?.score ?? 0} pts
                  </p>
                </div>
              </div>

              {/* Tu posición */}
              {myRank > 1 && (
                <div className="flex items-center justify-between rounded-xl bg-primary/10 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tu posición</p>
                    <p className="text-lg font-bold">#{myRank} de {rankedPlayers.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tu puntaje</p>
                    <p className="text-lg font-bold">{myScore} pts</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Ranking completo */}
          <div className="rounded-xl border border-border p-4">
            <h4 className="mb-4 text-center font-semibold">Ranking Final</h4>
            <div className="flex flex-col gap-2">
              {rankedPlayers.map((player, index) => (
                <div
                  key={player.userId}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                    player.userId === game.myPlayer?.userId
                      ? "bg-primary/10 ring-2 ring-primary"
                      : index < 3
                        ? "bg-muted"
                        : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-bold ${
                        index < 3 ? podiumColors[index] : "text-muted-foreground"
                      }`}
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
                    {player.userId === game.myPlayer?.userId && (
                      <span className="text-xs text-muted-foreground">(tú)</span>
                    )}
                    {isTeamsMode && player.team && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        E{player.team}
                      </span>
                    )}
                  </div>
                  <span className={`font-bold ${index < 3 ? podiumColors[index] : ""}`}>
                    {player.score} pts
                  </span>
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
            className="h-14 w-full rounded-xl text-base"
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
