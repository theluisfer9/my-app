import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect } from "react";

import type { Id } from "@my-app/backend/convex/_generated/dataModel";
import { api } from "@my-app/backend/convex/_generated/api";

export function useHitsterGame(roomId: Id<"hitsterRooms">) {
  const gameState = useQuery(api.hitster.queries.getGameState, { roomId });

  const startGameMutation = useMutation(api.hitster.mutations.startGame);
  const leaveRoomMutation = useMutation(api.hitster.mutations.leaveRoom);
  const advancePhaseMutation = useMutation(api.hitster.mutations.advancePhase);
  const placeCardMutation = useMutation(api.hitster.mutations.placeCard);
  const submitBonusMutation = useMutation(api.hitster.mutations.submitBonus);
  const nextTurnMutation = useMutation(api.hitster.mutations.nextTurn);
  const playAgainMutation = useMutation(api.hitster.mutations.playAgain);
  const heartbeatMutation = useMutation(api.hitster.mutations.heartbeat);
  const loadDeckAction = useAction(api.hitster.actions.loadDeck);

  // Heartbeat para mantener conexión
  useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(() => {
      heartbeatMutation({ roomId });
    }, 30000);

    // Enviar inmediatamente al montar
    heartbeatMutation({ roomId });

    return () => clearInterval(interval);
  }, [roomId, heartbeatMutation]);

  const startGame = async () => {
    // Cargar canciones de todos los decks que tengan 0 canciones
    const decksToLoad = decks.filter((d) => d.songCount === 0);
    for (const d of decksToLoad) {
      const loadResult = await loadDeckAction({ deckId: d._id as any });
      if (!loadResult.success) {
        throw new Error(loadResult.error ?? `Error cargando ${d.name}`);
      }
    }
    return startGameMutation({ roomId });
  };

  const leaveRoom = async () => {
    return leaveRoomMutation({ roomId });
  };

  const advanceToPlacing = async () => {
    return advancePhaseMutation({ roomId });
  };

  const placeCard = async (positionIndex: number) => {
    return placeCardMutation({ roomId, positionIndex });
  };

  const submitBonus = async (artistGuess: string, songGuess: string) => {
    return submitBonusMutation({ roomId, artistGuess, songGuess });
  };

  const nextTurn = async () => {
    return nextTurnMutation({ roomId });
  };

  const playAgain = async () => {
    return playAgainMutation({ roomId });
  };

  // Computed values
  const room = gameState?.room;
  const players = gameState?.players ?? [];
  const currentTurn = gameState?.currentTurn;
  const currentSong = gameState?.currentSong;
  const deck = gameState?.deck;
  const decks = gameState?.decks ?? [];
  const isHost = gameState?.isHost ?? false;
  const isMyTurn = gameState?.isMyTurn ?? false;
  const myPlayer = gameState?.myPlayer;
  const cardsRemaining = gameState?.cardsRemaining ?? 0;

  const connectedPlayers = players.filter((p) => p.isConnected);
  const currentPlayer = currentTurn
    ? players.find((p) => p._id === currentTurn.playerId)
    : null;

  const phase = currentTurn?.phase ?? "listening";
  const roomStatus = room?.status ?? "waiting";

  // Timeline del jugador actual (el que está jugando el turno)
  const activeTimeline = currentPlayer?.timelineWithDetails ?? [];

  // Mi timeline
  const myTimeline = myPlayer?.timelineWithDetails ?? [];

  // Ranking por puntaje
  const rankedPlayers = [...players]
    .filter((p) => p.isConnected)
    .sort((a, b) => {
      // Primero por puntaje
      if (b.score !== a.score) return b.score - a.score;
      // Empate: más cartas en timeline gana
      return b.timeline.length - a.timeline.length;
    });

  return {
    // Loading state
    isLoading: gameState === undefined,

    // Core data
    room,
    players,
    connectedPlayers,
    currentTurn,
    currentSong,
    currentPlayer,
    deck,
    decks,
    cardsRemaining,

    // Game state
    roomStatus,
    phase,
    isHost,
    isMyTurn,
    myPlayer,
    myTimeline,
    activeTimeline,
    rankedPlayers,

    // Actions
    startGame,
    leaveRoom,
    advanceToPlacing,
    placeCard,
    submitBonus,
    nextTurn,
    playAgain,
  };
}
