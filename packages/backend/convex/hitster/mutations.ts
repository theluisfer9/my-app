import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { authComponent } from "../auth";

// Generar código único de sala (5 caracteres)
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// Barajar array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Normalizar string para comparación fuzzy
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[^a-z0-9]/g, ""); // solo alfanumérico
}

// Distancia de Levenshtein para fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Comparar respuesta con tolerancia a typos
function fuzzyMatch(input: string, target: string): boolean {
  const norm1 = normalizeString(input);
  const norm2 = normalizeString(target);

  if (norm1 === norm2) return true;

  // Permitir distancia de Levenshtein <= 2 para strings largos
  const maxDistance = Math.min(2, Math.floor(norm2.length * 0.2));
  return levenshteinDistance(norm1, norm2) <= maxDistance;
}

// Crear una nueva sala
export const createRoom = mutation({
  args: {
    name: v.string(),
    cardsToWin: v.optional(v.number()),
    turnTimeLimit: v.optional(v.number()),
    gameMode: v.optional(v.union(v.literal("remote"), v.literal("group"))),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    // Generar código único
    let code = generateRoomCode();
    let existingRoom = await ctx.db
      .query("hitsterRooms")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    while (existingRoom) {
      code = generateRoomCode();
      existingRoom = await ctx.db
        .query("hitsterRooms")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
    }

    const now = Date.now();

    const roomId = await ctx.db.insert("hitsterRooms", {
      name: args.name || `Sala de ${user.name}`,
      code,
      hostId: user._id,
      status: "waiting",
      cardsToWin: args.cardsToWin ?? 6,
      turnTimeLimit: args.turnTimeLimit,
      gameMode: args.gameMode ?? "remote",
      currentPlayerIndex: 0,
      playerOrder: [],
      deckCardIds: [],
      currentCardIndex: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Agregar al host como jugador
    await ctx.db.insert("hitsterPlayers", {
      roomId,
      userId: user._id,
      name: user.name,
      avatarUrl: user.image ?? undefined,
      isHost: true,
      isConnected: true,
      score: 0,
      timeline: [],
      joinedAt: now,
      lastSeenAt: now,
    });

    return { roomId, code };
  },
});

// Unirse a una sala
export const joinRoom = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db
      .query("hitsterRooms")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!room) throw new Error("Sala no encontrada");
    if (room.status !== "waiting") throw new Error("La sala ya está en juego");

    // Verificar si ya está en la sala
    const existingPlayer = await ctx.db
      .query("hitsterPlayers")
      .withIndex("by_room_user", (q) =>
        q.eq("roomId", room._id).eq("userId", user._id)
      )
      .first();

    if (existingPlayer) {
      // Reconectar
      await ctx.db.patch(existingPlayer._id, {
        isConnected: true,
        lastSeenAt: Date.now(),
      });
      return { roomId: room._id, playerId: existingPlayer._id };
    }

    // Verificar capacidad (máximo 8 jugadores)
    const players = await ctx.db
      .query("hitsterPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    if (players.length >= 8) {
      throw new Error("Sala llena (máximo 8 jugadores)");
    }

    const now = Date.now();
    const playerId = await ctx.db.insert("hitsterPlayers", {
      roomId: room._id,
      userId: user._id,
      name: user.name,
      avatarUrl: user.image ?? undefined,
      isHost: false,
      isConnected: true,
      score: 0,
      timeline: [],
      joinedAt: now,
      lastSeenAt: now,
    });

    return { roomId: room._id, playerId };
  },
});

// Salir de una sala
export const leaveRoom = mutation({
  args: {
    roomId: v.id("hitsterRooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const player = await ctx.db
      .query("hitsterPlayers")
      .withIndex("by_room_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id)
      )
      .first();

    if (!player) throw new Error("No estás en esta sala");

    await ctx.db.patch(player._id, { isConnected: false });

    const room = await ctx.db.get(args.roomId);
    if (!room) return { success: true };

    // Contar jugadores conectados restantes
    const connectedPlayers = await ctx.db
      .query("hitsterPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isConnected"), true))
      .collect();

    // Si no quedan jugadores conectados, eliminar sala
    if (connectedPlayers.length === 0) {
      const allPlayers = await ctx.db
        .query("hitsterPlayers")
        .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
        .collect();
      for (const p of allPlayers) {
        await ctx.db.delete(p._id);
      }

      // Eliminar turnos
      const turns = await ctx.db
        .query("hitsterTurns")
        .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
        .collect();
      for (const turn of turns) {
        await ctx.db.delete(turn._id);
      }

      await ctx.db.delete(args.roomId);
      return { success: true, deleted: true };
    }

    // Si es el host y la sala está esperando, transferir host
    if (player.isHost && room.status === "waiting") {
      await ctx.db.patch(connectedPlayers[0]._id, { isHost: true });
      await ctx.db.patch(args.roomId, {
        hostId: connectedPlayers[0].userId,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Configurar deck (seleccionar playlist) - soporta múltiples decks
export const setDeck = mutation({
  args: {
    roomId: v.id("hitsterRooms"),
    deckId: v.optional(v.id("hitsterDecks")), // Legacy single deck
    deckIds: v.optional(v.array(v.id("hitsterDecks"))), // Multiple decks
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Sala no encontrada");
    if (room.hostId !== user._id) throw new Error("Solo el host puede configurar");
    if (room.status !== "waiting") throw new Error("La sala ya inició");

    // Soportar ambos: single deck y multiple decks
    const deckIdsToUse = args.deckIds ?? (args.deckId ? [args.deckId] : []);

    if (deckIdsToUse.length === 0) {
      throw new Error("Selecciona al menos un deck");
    }

    // Validar que todos los decks existan
    for (const deckId of deckIdsToUse) {
      const deck = await ctx.db.get(deckId);
      if (!deck) throw new Error(`Deck ${deckId} no encontrado`);
    }

    await ctx.db.patch(args.roomId, {
      deckId: deckIdsToUse[0], // Mantener retrocompatibilidad
      deckIds: deckIdsToUse,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Iniciar el juego
export const startGame = mutation({
  args: {
    roomId: v.id("hitsterRooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Sala no encontrada");
    if (room.hostId !== user._id) throw new Error("Solo el host puede iniciar");
    if (room.status !== "waiting") throw new Error("El juego ya inició");

    // Obtener deckIds (nuevo) o deckId (legacy)
    const deckIdsToUse = room.deckIds ?? (room.deckId ? [room.deckId] : []);
    if (deckIdsToUse.length === 0) {
      throw new Error("Selecciona un deck primero");
    }

    const players = await ctx.db
      .query("hitsterPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isConnected"), true))
      .collect();

    if (players.length < 2) {
      throw new Error("Se necesitan al menos 2 jugadores");
    }

    // Obtener canciones de todos los decks seleccionados
    const allSongs = [];
    for (const deckId of deckIdsToUse) {
      const deckSongs = await ctx.db
        .query("hitsterSongs")
        .withIndex("by_deck", (q) => q.eq("deckId", deckId))
        .collect();
      allSongs.push(...deckSongs);
    }

    if (allSongs.length < 30) {
      throw new Error("Los decks necesitan al menos 30 canciones en total");
    }

    // Usar allSongs en lugar de songs
    const songs = allSongs;

    // Barajar canciones
    const shuffledSongIds = shuffleArray(songs.map((s) => s._id));

    // Barajar orden de jugadores
    const shuffledPlayers = shuffleArray(players);
    const playerOrder = shuffledPlayers.map((p) => p.userId);

    // Dar una carta inicial a cada jugador
    let cardIndex = 0;
    for (const player of shuffledPlayers) {
      const initialSong = songs.find((s) => s._id === shuffledSongIds[cardIndex]);
      if (initialSong) {
        await ctx.db.patch(player._id, {
          timeline: [
            {
              songId: initialSong._id,
              year: initialSong.releaseYear,
              isInitial: true,
            },
          ],
        });
        cardIndex++;
      }
    }

    const now = Date.now();

    // Actualizar sala
    await ctx.db.patch(args.roomId, {
      status: "playing",
      playerOrder,
      deckCardIds: shuffledSongIds,
      currentCardIndex: cardIndex,
      currentPlayerIndex: 0,
      updatedAt: now,
    });

    // Crear primer turno
    const firstPlayerId = shuffledPlayers[0]._id;
    const firstCardId = shuffledSongIds[cardIndex];

    await ctx.db.insert("hitsterTurns", {
      roomId: args.roomId,
      playerId: firstPlayerId,
      songId: firstCardId,
      phase: "listening",
      pointsEarned: 0,
      startedAt: now,
      phaseStartedAt: now,
    });

    // Incrementar índice de carta
    await ctx.db.patch(args.roomId, {
      currentCardIndex: cardIndex + 1,
    });

    return { success: true };
  },
});

// Colocar carta en timeline
export const placeCard = mutation({
  args: {
    roomId: v.id("hitsterRooms"),
    positionIndex: v.number(), // Índice donde insertar (0 = antes de todo, etc.)
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "playing") {
      throw new Error("Sala no válida");
    }

    // Obtener turno actual
    const currentTurn = await ctx.db
      .query("hitsterTurns")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .first();

    if (!currentTurn) throw new Error("No hay turno activo");
    if (currentTurn.phase !== "listening" && currentTurn.phase !== "placing") {
      throw new Error("No es momento de colocar");
    }

    // Verificar que es el jugador del turno
    const player = await ctx.db.get(currentTurn.playerId);
    if (!player || player.userId !== user._id) {
      throw new Error("No es tu turno");
    }

    // Obtener la canción del turno
    const song = await ctx.db.get(currentTurn.songId);
    if (!song) throw new Error("Canción no encontrada");

    // Validar posición
    const timeline = player.timeline;
    const songYear = song.releaseYear;

    // Verificar si la posición es correcta
    let isCorrect = true;

    // Verificar con carta anterior (si existe)
    if (args.positionIndex > 0) {
      const prevCard = timeline[args.positionIndex - 1];
      if (prevCard && prevCard.year > songYear) {
        isCorrect = false;
      }
    }

    // Verificar con carta siguiente (si existe)
    if (args.positionIndex < timeline.length) {
      const nextCard = timeline[args.positionIndex];
      if (nextCard && nextCard.year < songYear) {
        isCorrect = false;
      }
    }

    const now = Date.now();

    if (isCorrect) {
      // Agregar carta al timeline
      const newTimeline = [...timeline];
      newTimeline.splice(args.positionIndex, 0, {
        songId: song._id,
        year: songYear,
      });

      await ctx.db.patch(player._id, {
        timeline: newTimeline,
        score: player.score + 1, // +1 por posición correcta
      });

      // Actualizar turno a fase bonus
      await ctx.db.patch(currentTurn._id, {
        phase: "bonus",
        placedAtIndex: args.positionIndex,
        isCorrect: true,
        pointsEarned: 1,
        phaseStartedAt: now,
      });

      return { isCorrect: true, year: songYear };
    } else {
      // Carta incorrecta, pasar a resultado
      await ctx.db.patch(currentTurn._id, {
        phase: "result",
        placedAtIndex: args.positionIndex,
        isCorrect: false,
        pointsEarned: 0,
        phaseStartedAt: now,
      });

      return {
        isCorrect: false,
        year: songYear,
        artistName: song.artistName,
        songName: song.name,
      };
    }
  },
});

// Enviar respuestas de bonus (artista y canción)
export const submitBonus = mutation({
  args: {
    roomId: v.id("hitsterRooms"),
    artistGuess: v.string(),
    songGuess: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "playing") {
      throw new Error("Sala no válida");
    }

    // Obtener turno actual
    const currentTurn = await ctx.db
      .query("hitsterTurns")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .first();

    if (!currentTurn) throw new Error("No hay turno activo");
    if (currentTurn.phase !== "bonus") {
      throw new Error("No es momento de bonus");
    }

    // Verificar que es el jugador del turno
    const player = await ctx.db.get(currentTurn.playerId);
    if (!player || player.userId !== user._id) {
      throw new Error("No es tu turno");
    }

    // Obtener la canción
    const song = await ctx.db.get(currentTurn.songId);
    if (!song) throw new Error("Canción no encontrada");

    // Validar respuestas con fuzzy match
    const artistCorrect = fuzzyMatch(args.artistGuess, song.artistName);
    const songCorrect = fuzzyMatch(args.songGuess, song.name);

    let bonusPoints = 0;
    if (artistCorrect) bonusPoints++;
    if (songCorrect) bonusPoints++;

    const totalPoints = (currentTurn.pointsEarned || 0) + bonusPoints;

    // Actualizar puntuación del jugador
    if (bonusPoints > 0) {
      await ctx.db.patch(player._id, {
        score: player.score + bonusPoints,
      });
    }

    // Actualizar turno
    await ctx.db.patch(currentTurn._id, {
      phase: "result",
      artistGuess: args.artistGuess,
      songGuess: args.songGuess,
      artistCorrect,
      songCorrect,
      pointsEarned: totalPoints,
      phaseStartedAt: Date.now(),
    });

    return {
      artistCorrect,
      songCorrect,
      bonusPoints,
      totalPoints,
      correctArtist: song.artistName,
      correctSong: song.name,
    };
  },
});

// Pasar al siguiente turno
export const nextTurn = mutation({
  args: {
    roomId: v.id("hitsterRooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "playing") {
      throw new Error("Sala no válida");
    }

    const players = await ctx.db
      .query("hitsterPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isConnected"), true))
      .collect();

    // Verificar condición de victoria
    const winner = players.find((p) => p.timeline.length >= room.cardsToWin);
    if (winner) {
      await ctx.db.patch(args.roomId, {
        status: "finished",
        updatedAt: Date.now(),
      });
      return { finished: true, winnerId: winner._id, winnerName: winner.name };
    }

    // Verificar si quedan cartas
    if (room.currentCardIndex >= room.deckCardIds.length) {
      await ctx.db.patch(args.roomId, {
        status: "finished",
        updatedAt: Date.now(),
      });
      // Determinar ganador por puntaje
      const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
      return {
        finished: true,
        winnerId: sortedPlayers[0]._id,
        winnerName: sortedPlayers[0].name,
        reason: "deck_empty",
      };
    }

    // Siguiente jugador
    const nextPlayerIndex =
      (room.currentPlayerIndex + 1) % room.playerOrder.length;
    const nextPlayerUserId = room.playerOrder[nextPlayerIndex];
    const nextPlayer = players.find((p) => p.userId === nextPlayerUserId);

    if (!nextPlayer) throw new Error("Siguiente jugador no encontrado");

    const now = Date.now();

    // Crear nuevo turno
    const nextCardId = room.deckCardIds[room.currentCardIndex];

    await ctx.db.insert("hitsterTurns", {
      roomId: args.roomId,
      playerId: nextPlayer._id,
      songId: nextCardId,
      phase: "listening",
      pointsEarned: 0,
      startedAt: now,
      phaseStartedAt: now,
    });

    // Actualizar sala
    await ctx.db.patch(args.roomId, {
      currentPlayerIndex: nextPlayerIndex,
      currentCardIndex: room.currentCardIndex + 1,
      updatedAt: now,
    });

    return { finished: false, nextPlayerName: nextPlayer.name };
  },
});

// Jugar de nuevo
export const playAgain = mutation({
  args: {
    roomId: v.id("hitsterRooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Sala no encontrada");
    if (room.hostId !== user._id)
      throw new Error("Solo el host puede reiniciar");

    // Eliminar turnos anteriores
    const oldTurns = await ctx.db
      .query("hitsterTurns")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const turn of oldTurns) {
      await ctx.db.delete(turn._id);
    }

    // Resetear jugadores
    const players = await ctx.db
      .query("hitsterPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const player of players) {
      await ctx.db.patch(player._id, { score: 0, timeline: [] });
    }

    // Reiniciar sala
    await ctx.db.patch(args.roomId, {
      status: "waiting",
      currentPlayerIndex: 0,
      playerOrder: [],
      deckCardIds: [],
      currentCardIndex: 0,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Heartbeat
export const heartbeat = mutation({
  args: {
    roomId: v.id("hitsterRooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return;

    const player = await ctx.db
      .query("hitsterPlayers")
      .withIndex("by_room_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id)
      )
      .first();

    if (player) {
      await ctx.db.patch(player._id, {
        lastSeenAt: Date.now(),
        isConnected: true,
      });
    }
  },
});

// Cambiar fase del turno (para avanzar de listening a placing)
export const advancePhase = mutation({
  args: {
    roomId: v.id("hitsterRooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const currentTurn = await ctx.db
      .query("hitsterTurns")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .first();

    if (!currentTurn) throw new Error("No hay turno activo");

    const player = await ctx.db.get(currentTurn.playerId);
    if (!player || player.userId !== user._id) {
      throw new Error("No es tu turno");
    }

    if (currentTurn.phase === "listening") {
      await ctx.db.patch(currentTurn._id, {
        phase: "placing",
        phaseStartedAt: Date.now(),
      });
      return { phase: "placing" };
    }

    throw new Error("No se puede avanzar de esta fase");
  },
});
