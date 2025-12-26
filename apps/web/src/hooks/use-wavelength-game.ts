import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "@my-app/backend/convex/_generated/api";
import type { Id } from "@my-app/backend/convex/_generated/dataModel";

export function useWavelengthGame(roomId: Id<"rooms">) {
  // Queries reactivas
  const gameState = useQuery(api.wavelength.queries.getGameState, { roomId });

  // Mutations
  const startGameMutation = useMutation(api.wavelength.mutations.startGame);
  const submitClueMutation = useMutation(api.wavelength.mutations.submitClue);
  const submitGuessMutation = useMutation(api.wavelength.mutations.submitGuess);
  const nextRoundMutation = useMutation(api.wavelength.mutations.nextRound);
  const leaveRoomMutation = useMutation(api.wavelength.mutations.leaveRoom);
  const playAgainMutation = useMutation(api.wavelength.mutations.playAgain);
  const heartbeatMutation = useMutation(api.wavelength.mutations.heartbeat);
  const updateGuessPositionMutation = useMutation(api.wavelength.mutations.updateGuessPosition);

  // Heartbeat cada 10 segundos para mantener conexión activa
  useEffect(() => {
    const interval = setInterval(() => {
      heartbeatMutation({ roomId });
    }, 10000);

    // Enviar heartbeat inicial
    heartbeatMutation({ roomId });

    return () => clearInterval(interval);
  }, [roomId, heartbeatMutation]);

  // Acciones
  const startGame = async () => {
    return await startGameMutation({ roomId });
  };

  const submitClue = async (clue: string) => {
    return await submitClueMutation({ roomId, clue });
  };

  const submitGuess = async (position: number) => {
    return await submitGuessMutation({ roomId, position });
  };

  const nextRound = async () => {
    return await nextRoundMutation({ roomId });
  };

  const leaveRoom = async () => {
    return await leaveRoomMutation({ roomId });
  };

  const playAgain = async () => {
    return await playAgainMutation({ roomId });
  };

  const updateGuessPosition = async (position: number) => {
    return await updateGuessPositionMutation({ roomId, position });
  };

  return {
    // Estado
    gameState,
    isLoading: gameState === undefined,
    room: gameState?.room ?? null,
    players: gameState?.players ?? [],
    currentRound: gameState?.currentRound ?? null,
    spectrum: gameState?.spectrum ?? null,
    isHost: gameState?.isHost ?? false,
    isPsychic: gameState?.isPsychic ?? false,
    myPlayer: gameState?.myPlayer ?? null,
    playerGuesses: gameState?.playerGuesses ?? [],

    // Computed
    connectedPlayers: (gameState?.players ?? []).filter((p) => p.isConnected),
    roomStatus: gameState?.room?.status ?? "waiting",
    roundStatus: gameState?.currentRound?.status ?? null,
    gameMode: gameState?.room?.gameMode ?? "individual",
    // Mi guess actual en esta ronda
    myGuess: (gameState?.playerGuesses ?? []).find(
      (g) => g.userId === gameState?.myPlayer?.userId
    ),
    // Jugadores ordenados por score (para ranking)
    rankedPlayers: [...(gameState?.players ?? [])]
      .filter((p) => p.isConnected)
      .sort((a, b) => b.score - a.score),
    // Equipos (modo teams)
    team1Players: (gameState?.players ?? []).filter((p) => p.team === 1),
    team2Players: (gameState?.players ?? []).filter((p) => p.team === 2),
    team1Score: (gameState?.players ?? [])
      .filter((p) => p.team === 1)
      .reduce((sum, p) => sum + p.score, 0),
    team2Score: (gameState?.players ?? [])
      .filter((p) => p.team === 2)
      .reduce((sum, p) => sum + p.score, 0),
    myTeam: gameState?.myPlayer?.team ?? undefined,

    // Acciones
    startGame,
    submitClue,
    submitGuess,
    nextRound,
    leaveRoom,
    playAgain,
    updateGuessPosition,
  };
}
