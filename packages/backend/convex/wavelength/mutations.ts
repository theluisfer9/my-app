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

// Generar posición objetivo aleatoria (0-100)
function generateTargetPosition(): number {
  return Math.floor(Math.random() * 101);
}

// Calcular puntos basado en la diferencia
// Zonas de igual ancho (5 unidades cada una)
function calculatePoints(target: number, guess: number): number {
  const diff = Math.abs(target - guess);
  if (diff <= 2.5) return 4;  // Centro exacto (±2.5)
  if (diff <= 7.5) return 3;  // Casi perfecto (2.5-7.5)
  if (diff <= 12.5) return 2; // Buen intento (7.5-12.5)
  return 0; // Fuera de zona
}

// Crear una nueva sala
export const createRoom = mutation({
  args: {
    name: v.string(),
    isPrivate: v.boolean(),
    password: v.optional(v.string()),
    totalRounds: v.optional(v.number()),
    gameMode: v.optional(v.union(v.literal("individual"), v.literal("teams"))),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    // Generar código único
    let code = generateRoomCode();
    let existingRoom = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    // Regenerar si ya existe
    while (existingRoom) {
      code = generateRoomCode();
      existingRoom = await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
    }

    const now = Date.now();

    const roomId = await ctx.db.insert("rooms", {
      name: args.name || `Sala de ${user.name}`,
      code,
      hostId: user._id,
      isPrivate: args.isPrivate,
      password: args.isPrivate ? args.password : undefined,
      gameMode: args.gameMode ?? "individual", // Default: todos vs todos
      status: "waiting",
      currentRound: 0,
      totalRounds: args.totalRounds ?? 5,
      totalScore: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Agregar al host como jugador
    await ctx.db.insert("players", {
      roomId,
      userId: user._id,
      name: user.name,
      avatarUrl: user.image ?? undefined,
      isHost: true,
      isConnected: true,
      score: 0,
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
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!room) throw new Error("Sala no encontrada");
    if (room.status !== "waiting") throw new Error("La sala ya está en juego");

    // Verificar contraseña si es privada
    if (room.isPrivate && room.password !== args.password) {
      throw new Error("Contraseña incorrecta");
    }

    // Verificar si ya está en la sala
    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_room_and_user", (q) =>
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

    // Verificar capacidad (máximo 12 jugadores)
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    if (players.length >= 12) {
      throw new Error("Sala llena");
    }

    const now = Date.now();
    const playerId = await ctx.db.insert("players", {
      roomId: room._id,
      userId: user._id,
      name: user.name,
      avatarUrl: user.image ?? undefined,
      isHost: false,
      isConnected: true,
      score: 0,
      joinedAt: now,
      lastSeenAt: now,
    });

    return { roomId: room._id, playerId };
  },
});

// Salir de una sala
export const leaveRoom = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const player = await ctx.db
      .query("players")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id)
      )
      .first();

    if (!player) throw new Error("No estás en esta sala");

    await ctx.db.patch(player._id, { isConnected: false });

    const room = await ctx.db.get(args.roomId);
    if (!room) return { success: true };

    // Contar jugadores conectados restantes
    const connectedPlayers = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isConnected"), true))
      .collect();

    // Si no quedan jugadores conectados, eliminar sala completamente
    if (connectedPlayers.length === 0) {
      // Eliminar todos los jugadores
      const allPlayers = await ctx.db
        .query("players")
        .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
        .collect();
      for (const p of allPlayers) {
        await ctx.db.delete(p._id);
      }

      // Eliminar todas las rondas
      const rounds = await ctx.db
        .query("rounds")
        .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
        .collect();
      for (const round of rounds) {
        await ctx.db.delete(round._id);
      }

      // Eliminar la sala
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

// Iniciar el juego
export const startGame = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Sala no encontrada");
    if (room.hostId !== user._id) throw new Error("Solo el host puede iniciar");
    if (room.status !== "waiting") throw new Error("El juego ya inició");

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isConnected"), true))
      .collect();

    if (players.length < 2) {
      throw new Error("Se necesitan al menos 2 jugadores");
    }

    // Modo teams requiere mínimo 4 jugadores
    if (room.gameMode === "teams" && players.length < 4) {
      throw new Error("El modo por equipos requiere al menos 4 jugadores");
    }

    // Calcular rondas totales: roundsPerPlayer * número de jugadores
    // room.totalRounds representa las rondas por jugador
    const roundsPerPlayer = room.totalRounds;
    const actualTotalRounds = roundsPerPlayer * players.length;

    // Actualizar el total de rondas real
    await ctx.db.patch(args.roomId, {
      totalRounds: actualTotalRounds,
    });

    // Asignar equipos si es modo teams
    if (room.gameMode === "teams") {
      // Mezclar jugadores aleatoriamente
      const shuffled = [...players].sort(() => Math.random() - 0.5);

      // Dividir en 2 equipos
      for (let i = 0; i < shuffled.length; i++) {
        await ctx.db.patch(shuffled[i]._id, {
          team: (i % 2) + 1, // Alternamos entre equipo 1 y 2
        });
      }
    }

    // Obtener un espectro aleatorio activo
    const spectrums = await ctx.db
      .query("spectrums")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (spectrums.length === 0) {
      throw new Error("No hay espectros disponibles");
    }

    const randomSpectrum =
      spectrums[Math.floor(Math.random() * spectrums.length)];

    // Seleccionar psíquico aleatorio
    const psychic = players[Math.floor(Math.random() * players.length)];

    // Crear primera ronda
    await ctx.db.insert("rounds", {
      roomId: args.roomId,
      roundNumber: 1,
      spectrumId: randomSpectrum._id,
      psychicId: psychic.userId,
      targetPosition: generateTargetPosition(),
      status: "psychic_turn",
      createdAt: Date.now(),
    });

    // Actualizar sala
    await ctx.db.patch(args.roomId, {
      status: "playing",
      currentRound: 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Enviar pista (solo psíquico)
export const submitClue = mutation({
  args: {
    roomId: v.id("rooms"),
    clue: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "playing") {
      throw new Error("Sala no válida");
    }

    const currentRound = await ctx.db
      .query("rounds")
      .withIndex("by_room_and_number", (q) =>
        q.eq("roomId", args.roomId).eq("roundNumber", room.currentRound)
      )
      .first();

    if (!currentRound) throw new Error("Ronda no encontrada");
    if (currentRound.psychicId !== user._id) {
      throw new Error("No eres el psíquico de esta ronda");
    }
    if (currentRound.status !== "psychic_turn") {
      throw new Error("No es tu turno para dar pista");
    }

    await ctx.db.patch(currentRound._id, {
      clue: args.clue.trim(),
      status: "guessing",
    });

    return { success: true };
  },
});

// Enviar respuesta (cada jugador confirma su guess)
export const submitGuess = mutation({
  args: {
    roomId: v.id("rooms"),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    if (args.position < 0 || args.position > 100) {
      throw new Error("Posición inválida");
    }

    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "playing") {
      throw new Error("Sala no válida");
    }

    const currentRound = await ctx.db
      .query("rounds")
      .withIndex("by_room_and_number", (q) =>
        q.eq("roomId", args.roomId).eq("roundNumber", room.currentRound)
      )
      .first();

    if (!currentRound) throw new Error("Ronda no encontrada");
    if (currentRound.status !== "guessing") {
      throw new Error("No es momento de adivinar");
    }

    // El psíquico no puede adivinar
    if (currentRound.psychicId === user._id) {
      throw new Error("El psíquico no puede adivinar");
    }

    // Calcular puntos para este jugador
    const points = calculatePoints(currentRound.targetPosition, args.position);

    // Buscar si ya tiene un registro de guess
    const existingGuess = await ctx.db
      .query("playerGuesses")
      .withIndex("by_round_and_user", (q) =>
        q.eq("roundId", currentRound._id).eq("userId", user._id)
      )
      .first();

    const now = Date.now();

    if (existingGuess) {
      // Si ya confirmó, no puede volver a confirmar
      if (existingGuess.confirmedAt) {
        throw new Error("Ya confirmaste tu respuesta");
      }
      // Confirmar el guess
      await ctx.db.patch(existingGuess._id, {
        position: args.position,
        finalPosition: args.position,
        pointsEarned: points,
        confirmedAt: now,
        updatedAt: now,
      });
    } else {
      // Crear nuevo guess confirmado
      await ctx.db.insert("playerGuesses", {
        roundId: currentRound._id,
        userId: user._id,
        position: args.position,
        finalPosition: args.position,
        pointsEarned: points,
        confirmedAt: now,
        updatedAt: now,
      });
    }

    // Actualizar puntuación del jugador
    const player = await ctx.db
      .query("players")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", user._id)
      )
      .first();

    if (player) {
      await ctx.db.patch(player._id, {
        score: player.score + points,
      });
    }

    // Verificar si todos los jugadores (excepto psíquico) han confirmado
    const allPlayers = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isConnected"), true))
      .collect();

    const playersToGuess = allPlayers.filter(
      (p) => p.userId !== currentRound.psychicId
    );

    const allGuesses = await ctx.db
      .query("playerGuesses")
      .withIndex("by_round", (q) => q.eq("roundId", currentRound._id))
      .collect();

    const confirmedGuesses = allGuesses.filter((g) => g.confirmedAt);

    // Si todos confirmaron, pasar a resultados
    if (confirmedGuesses.length >= playersToGuess.length) {
      // Calcular puntos totales de la ronda (para modo teams o estadísticas)
      const totalRoundPoints = confirmedGuesses.reduce(
        (sum, g) => sum + (g.pointsEarned ?? 0),
        0
      );

      // Calcular puntos del psíquico: 1 punto por cada adivinador que acertó (puntos > 0)
      const psychicPoints = confirmedGuesses.filter((g) => (g.pointsEarned ?? 0) > 0).length;

      // Actualizar puntuación del psíquico
      const psychicPlayer = await ctx.db
        .query("players")
        .withIndex("by_room_and_user", (q) =>
          q.eq("roomId", args.roomId).eq("userId", currentRound.psychicId)
        )
        .first();

      if (psychicPlayer) {
        await ctx.db.patch(psychicPlayer._id, {
          score: psychicPlayer.score + psychicPoints,
        });
      }

      await ctx.db.patch(currentRound._id, {
        guessPosition: args.position, // Último guess (para compatibilidad)
        pointsEarned: totalRoundPoints,
        status: "results",
        completedAt: now,
      });

      // Actualizar puntuación total de sala (para modo teams)
      await ctx.db.patch(args.roomId, {
        totalScore: room.totalScore + totalRoundPoints,
        updatedAt: now,
      });
    }

    return { points, targetPosition: currentRound.targetPosition };
  },
});

// Pasar a la siguiente ronda
export const nextRound = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "playing") {
      throw new Error("Sala no válida");
    }

    // Marcar ronda actual como completada
    const currentRound = await ctx.db
      .query("rounds")
      .withIndex("by_room_and_number", (q) =>
        q.eq("roomId", args.roomId).eq("roundNumber", room.currentRound)
      )
      .first();

    if (currentRound) {
      await ctx.db.patch(currentRound._id, { status: "completed" });
    }

    // Verificar si es la última ronda
    if (room.currentRound >= room.totalRounds) {
      await ctx.db.patch(args.roomId, {
        status: "finished",
        updatedAt: Date.now(),
      });

      return { finished: true, totalScore: room.totalScore };
    }

    // Obtener jugadores conectados
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isConnected"), true))
      .collect();

    // Obtener espectros ya usados en esta partida
    const usedRounds = await ctx.db
      .query("rounds")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const usedSpectrumIds = new Set(usedRounds.map((r) => r.spectrumId));

    // Obtener espectros disponibles (no usados)
    const spectrums = await ctx.db
      .query("spectrums")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const availableSpectrums = spectrums.filter(
      (s) => !usedSpectrumIds.has(s._id)
    );
    const spectrum =
      availableSpectrums.length > 0
        ? availableSpectrums[Math.floor(Math.random() * availableSpectrums.length)]
        : spectrums[Math.floor(Math.random() * spectrums.length)];

    // Rotar psíquico
    let nextPsychic;
    if (room.gameMode === "teams") {
      // En modo teams, alternar entre equipos
      const currentPsychic = players.find(
        (p) => p.userId === currentRound?.psychicId
      );
      const currentTeam = currentPsychic?.team ?? 1;
      const nextTeam = currentTeam === 1 ? 2 : 1;

      // Buscar jugadores del siguiente equipo que no han sido psíquicos recientemente
      const teamPlayers = players.filter((p) => p.team === nextTeam);
      nextPsychic = teamPlayers[Math.floor(Math.random() * teamPlayers.length)];
    } else {
      // Modo individual: rotar en orden
      const currentPsychicIndex = players.findIndex(
        (p) => p.userId === currentRound?.psychicId
      );
      const nextPsychicIndex = (currentPsychicIndex + 1) % players.length;
      nextPsychic = players[nextPsychicIndex];
    }

    const nextRoundNumber = room.currentRound + 1;

    // Crear siguiente ronda
    await ctx.db.insert("rounds", {
      roomId: args.roomId,
      roundNumber: nextRoundNumber,
      spectrumId: spectrum._id,
      psychicId: nextPsychic.userId,
      targetPosition: generateTargetPosition(),
      status: "psychic_turn",
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.roomId, {
      currentRound: nextRoundNumber,
      updatedAt: Date.now(),
    });

    return { finished: false, nextRound: nextRoundNumber };
  },
});

// Jugar de nuevo (reiniciar sala)
export const playAgain = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("No autorizado");

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Sala no encontrada");
    if (room.hostId !== user._id)
      throw new Error("Solo el host puede reiniciar");

    // Eliminar rondas anteriores y sus guesses
    const oldRounds = await ctx.db
      .query("rounds")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const round of oldRounds) {
      // Eliminar guesses de esta ronda
      const guesses = await ctx.db
        .query("playerGuesses")
        .withIndex("by_round", (q) => q.eq("roundId", round._id))
        .collect();
      for (const guess of guesses) {
        await ctx.db.delete(guess._id);
      }
      await ctx.db.delete(round._id);
    }

    // Resetear scores y equipos de todos los jugadores
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const player of players) {
      await ctx.db.patch(player._id, { score: 0, team: undefined });
    }

    // Reiniciar sala
    await ctx.db.patch(args.roomId, {
      status: "waiting",
      currentRound: 0,
      totalScore: 0,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Heartbeat para mantener conexión activa
export const heartbeat = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return;

    const player = await ctx.db
      .query("players")
      .withIndex("by_room_and_user", (q) =>
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

// Actualizar posición del dial en tiempo real (para que otros vean)
export const updateGuessPosition = mutation({
  args: {
    roomId: v.id("rooms"),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return;

    if (args.position < 0 || args.position > 100) return;

    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "playing") return;

    // Obtener ronda actual
    const currentRound = await ctx.db
      .query("rounds")
      .withIndex("by_room_and_number", (q) =>
        q.eq("roomId", args.roomId).eq("roundNumber", room.currentRound)
      )
      .first();

    if (!currentRound || currentRound.status !== "guessing") return;

    // No permitir que el psíquico actualice posición
    if (currentRound.psychicId === user._id) return;

    // Buscar si ya existe un registro para este jugador en esta ronda
    const existingGuess = await ctx.db
      .query("playerGuesses")
      .withIndex("by_round_and_user", (q) =>
        q.eq("roundId", currentRound._id).eq("userId", user._id)
      )
      .first();

    if (existingGuess) {
      await ctx.db.patch(existingGuess._id, {
        position: args.position,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("playerGuesses", {
        roundId: currentRound._id,
        userId: user._id,
        position: args.position,
        updatedAt: Date.now(),
      });
    }
  },
});
