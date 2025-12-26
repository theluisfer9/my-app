import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";

// Obtener estado completo del juego
export const getGameState = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;

    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const myPlayer = players.find((p) => p.userId === user._id);
    if (!myPlayer) return null;

    let currentRound = null;
    let spectrum = null;
    let isPsychic = false;
    let playerGuesses: Array<{
      userId: string;
      position: number;
      finalPosition?: number;
      pointsEarned?: number;
      confirmed: boolean;
      player: (typeof players)[0] | undefined;
    }> = [];

    if (room.currentRound > 0) {
      const round = await ctx.db
        .query("rounds")
        .withIndex("by_room_and_number", (q) =>
          q.eq("roomId", args.roomId).eq("roundNumber", room.currentRound)
        )
        .first();

      if (round) {
        spectrum = await ctx.db.get(round.spectrumId);
        isPsychic = round.psychicId === user._id;

        // Ocultar targetPosition si no es psíquico y no estamos en resultados
        if (
          !isPsychic &&
          round.status !== "results" &&
          round.status !== "completed"
        ) {
          currentRound = { ...round, targetPosition: -1 };
        } else {
          currentRound = round;
        }

        // Obtener posiciones de adivinanza durante guessing y results
        if (round.status === "guessing" || round.status === "results") {
          const guesses = await ctx.db
            .query("playerGuesses")
            .withIndex("by_round", (q) => q.eq("roundId", round._id))
            .collect();

          playerGuesses = guesses.map((g) => ({
            userId: g.userId,
            position: g.position,
            finalPosition: g.finalPosition,
            pointsEarned: g.pointsEarned,
            confirmed: !!g.confirmedAt,
            player: players.find((p) => p.userId === g.userId),
          }));
        }
      }
    }

    return {
      room,
      players,
      currentRound,
      spectrum,
      isHost: room.hostId === user._id,
      isPsychic,
      myPlayer,
      playerGuesses,
    };
  },
});

// Buscar sala por código
export const getRoomByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!room) return null;

    const playerCount = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .filter((q) => q.eq(q.field("isConnected"), true))
      .collect();

    return {
      _id: room._id,
      name: room.name,
      isPrivate: room.isPrivate,
      status: room.status,
      playerCount: playerCount.length,
    };
  },
});

// Obtener jugadores de una sala
export const getRoomPlayers = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

// Obtener ronda actual
export const getCurrentRound = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;

    const room = await ctx.db.get(args.roomId);
    if (!room || room.currentRound === 0) return null;

    const round = await ctx.db
      .query("rounds")
      .withIndex("by_room_and_number", (q) =>
        q.eq("roomId", args.roomId).eq("roundNumber", room.currentRound)
      )
      .first();

    if (!round) return null;

    const spectrum = await ctx.db.get(round.spectrumId);
    const isPsychic = round.psychicId === user._id;

    // Solo el psíquico ve la posición objetivo durante psychic_turn y guessing
    const targetPosition =
      isPsychic || round.status === "results" || round.status === "completed"
        ? round.targetPosition
        : undefined;

    return {
      ...round,
      spectrum,
      isPsychic,
      targetPosition,
      totalRounds: room.totalRounds,
      totalScore: room.totalScore,
    };
  },
});

// Obtener espectros activos
export const getSpectrums = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("spectrums")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    return await ctx.db
      .query("spectrums")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Obtener categorías de espectros
export const getSpectrumCategories = query({
  args: {},
  handler: async (ctx) => {
    const spectrums = await ctx.db
      .query("spectrums")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const categories = [...new Set(spectrums.map((s) => s.category))];
    return categories;
  },
});
