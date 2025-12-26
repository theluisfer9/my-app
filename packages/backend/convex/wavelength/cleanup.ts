import { internalMutation } from "../_generated/server";

// Tiempos de expiración
const WAITING_ROOM_TTL = 60 * 60 * 1000; // 1 hora para salas en espera
const FINISHED_ROOM_TTL = 24 * 60 * 60 * 1000; // 24 horas para salas terminadas
const DISCONNECTED_PLAYER_TTL = 30 * 60 * 1000; // 30 minutos para jugadores desconectados

export const cleanupStaleRooms = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // 1. Eliminar salas en "waiting" sin actividad por más de 1 hora
    const waitingRooms = await ctx.db
      .query("rooms")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();

    for (const room of waitingRooms) {
      if (now - room.updatedAt > WAITING_ROOM_TTL) {
        await deleteRoom(ctx, room._id);
      }
    }

    // 2. Eliminar salas "finished" por más de 24 horas
    const finishedRooms = await ctx.db
      .query("rooms")
      .withIndex("by_status", (q) => q.eq("status", "finished"))
      .collect();

    for (const room of finishedRooms) {
      if (now - room.updatedAt > FINISHED_ROOM_TTL) {
        await deleteRoom(ctx, room._id);
      }
    }

    // 3. Marcar jugadores desconectados por más de 30 minutos
    const allPlayers = await ctx.db.query("players").collect();

    for (const player of allPlayers) {
      if (player.isConnected && now - player.lastSeenAt > DISCONNECTED_PLAYER_TTL) {
        await ctx.db.patch(player._id, { isConnected: false });

        // Verificar si la sala quedó sin jugadores conectados
        const room = await ctx.db.get(player.roomId);
        if (room && room.status === "waiting") {
          const connectedPlayers = await ctx.db
            .query("players")
            .withIndex("by_room", (q) => q.eq("roomId", player.roomId))
            .filter((q) => q.eq(q.field("isConnected"), true))
            .collect();

          if (connectedPlayers.length === 0) {
            await deleteRoom(ctx, player.roomId);
          }
        }
      }
    }

    return { success: true };
  },
});

// Helper para eliminar sala y sus datos relacionados
async function deleteRoom(
  ctx: { db: any },
  roomId: any
) {
  // Eliminar jugadores de la sala
  const players = await ctx.db
    .query("players")
    .withIndex("by_room", (q: any) => q.eq("roomId", roomId))
    .collect();

  for (const player of players) {
    await ctx.db.delete(player._id);
  }

  // Eliminar rondas de la sala
  const rounds = await ctx.db
    .query("rounds")
    .withIndex("by_room", (q: any) => q.eq("roomId", roomId))
    .collect();

  for (const round of rounds) {
    await ctx.db.delete(round._id);
  }

  // Eliminar la sala
  await ctx.db.delete(roomId);
}
