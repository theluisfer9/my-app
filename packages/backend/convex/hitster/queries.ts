import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";

// Obtener estado completo del juego
export const getGameState = query({
  args: {
    roomId: v.id("hitsterRooms"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    // Obtener jugadores
    const players = await ctx.db
      .query("hitsterPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Obtener turno actual
    const currentTurn = await ctx.db
      .query("hitsterTurns")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .first();

    // Obtener canción del turno actual (sin revelar año hasta resultado)
    let currentSong = null;
    if (currentTurn) {
      const song = await ctx.db.get(currentTurn.songId);
      if (song) {
        // Solo mostrar año si ya se reveló (fase result o si es incorrecto)
        const showYear =
          currentTurn.phase === "result" ||
          currentTurn.phase === "revealing" ||
          currentTurn.isCorrect !== undefined;

        currentSong = {
          _id: song._id,
          name: showYear ? song.name : undefined,
          artistName: showYear ? song.artistName : undefined,
          albumName: song.albumName,
          releaseYear: showYear ? song.releaseYear : undefined,
          previewUrl: song.previewUrl,
          coverUrl: song.coverUrl,
        };
      }
    }

    // Obtener deck info
    let deck = null;
    if (room.deckId) {
      deck = await ctx.db.get(room.deckId);
    }

    // Obtener jugador actual del turno
    const currentPlayer = currentTurn
      ? players.find((p) => p._id === currentTurn.playerId)
      : null;

    // Determinar si el usuario actual es el jugador del turno
    const isMyTurn = currentPlayer?.userId === user?._id;

    // Mi jugador
    const myPlayer = user
      ? players.find((p) => p.userId === user._id)
      : null;

    // Obtener canciones del timeline para mostrar nombres/artistas
    const timelinesWithSongs = await Promise.all(
      players.map(async (player) => {
        const timelineWithDetails = await Promise.all(
          player.timeline.map(async (item) => {
            const song = await ctx.db.get(item.songId);
            return {
              songId: item.songId,
              year: item.year,
              name: song?.name,
              artistName: song?.artistName,
              coverUrl: song?.coverUrl,
            };
          })
        );
        return {
          ...player,
          timelineWithDetails,
        };
      })
    );

    return {
      room,
      players: timelinesWithSongs,
      currentTurn: currentTurn
        ? {
            ...currentTurn,
            playerName: currentPlayer?.name,
          }
        : null,
      currentSong,
      deck,
      isHost: room.hostId === user?._id,
      isMyTurn,
      myPlayer: myPlayer
        ? timelinesWithSongs.find((p) => p._id === myPlayer._id)
        : null,
      cardsRemaining: room.deckCardIds.length - room.currentCardIndex,
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
      .query("hitsterRooms")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!room) return null;

    const players = await ctx.db
      .query("hitsterPlayers")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .filter((q) => q.eq(q.field("isConnected"), true))
      .collect();

    let deckName = null;
    if (room.deckId) {
      const deck = await ctx.db.get(room.deckId);
      deckName = deck?.name;
    }

    return {
      _id: room._id,
      name: room.name,
      status: room.status,
      playerCount: players.length,
      maxPlayers: 8,
      cardsToWin: room.cardsToWin,
      deckName,
    };
  },
});

// Obtener decks disponibles
export const getDecks = query({
  args: {
    publicOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    let decks;
    if (args.publicOnly) {
      decks = await ctx.db
        .query("hitsterDecks")
        .withIndex("by_public", (q) => q.eq("isPublic", true))
        .collect();
    } else {
      // Obtener públicos + los creados por el usuario
      const publicDecks = await ctx.db
        .query("hitsterDecks")
        .withIndex("by_public", (q) => q.eq("isPublic", true))
        .collect();

      const userDecks = user
        ? await ctx.db
            .query("hitsterDecks")
            .filter((q) =>
              q.and(
                q.eq(q.field("createdBy"), user._id),
                q.eq(q.field("isPublic"), false)
              )
            )
            .collect()
        : [];

      decks = [...publicDecks, ...userDecks];
    }

    return decks;
  },
});

// Obtener salas recientes del usuario
export const getMyRooms = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];

    // Buscar jugadores del usuario
    const myPlayers = await ctx.db
      .query("hitsterPlayers")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    // Obtener salas únicas
    const roomIds = [...new Set(myPlayers.map((p) => p.roomId))];
    const rooms = await Promise.all(
      roomIds.map(async (roomId) => {
        const room = await ctx.db.get(roomId);
        if (!room) return null;

        const players = await ctx.db
          .query("hitsterPlayers")
          .withIndex("by_room", (q) => q.eq("roomId", roomId))
          .filter((q) => q.eq(q.field("isConnected"), true))
          .collect();

        return {
          ...room,
          playerCount: players.length,
        };
      })
    );

    return rooms
      .filter((r) => r !== null)
      .sort((a, b) => b!.updatedAt - a!.updatedAt)
      .slice(0, 10);
  },
});
