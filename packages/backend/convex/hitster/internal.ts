import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { authComponent } from "../auth";

// Crear deck con sus canciones (llamado desde action)
export const createDeck = internalMutation({
  args: {
    name: v.string(),
    spotifyPlaylistId: v.string(),
    spotifyPlaylistUrl: v.optional(v.string()),
    songCount: v.number(),
    isPublic: v.boolean(),
    songs: v.array(
      v.object({
        spotifyTrackId: v.string(),
        name: v.string(),
        artistName: v.string(),
        albumName: v.string(),
        releaseYear: v.number(),
        previewUrl: v.string(),
        coverUrl: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Verificar si ya existe un deck con esta playlist
    const existingDeck = await ctx.db
      .query("hitsterDecks")
      .withIndex("by_playlist", (q) =>
        q.eq("spotifyPlaylistId", args.spotifyPlaylistId)
      )
      .first();

    if (existingDeck) {
      // Actualizar deck existente
      await ctx.db.patch(existingDeck._id, {
        name: args.name,
        songCount: args.songCount,
      });

      // Eliminar canciones anteriores
      const oldSongs = await ctx.db
        .query("hitsterSongs")
        .withIndex("by_deck", (q) => q.eq("deckId", existingDeck._id))
        .collect();

      for (const song of oldSongs) {
        await ctx.db.delete(song._id);
      }

      // Insertar nuevas canciones
      for (const song of args.songs) {
        await ctx.db.insert("hitsterSongs", {
          deckId: existingDeck._id,
          ...song,
        });
      }

      return existingDeck._id;
    }

    // Crear nuevo deck
    const deckId = await ctx.db.insert("hitsterDecks", {
      name: args.name,
      spotifyPlaylistId: args.spotifyPlaylistId,
      spotifyPlaylistUrl: args.spotifyPlaylistUrl,
      songCount: args.songCount,
      createdBy: "system", // TODO: obtener userId del contexto si está disponible
      isPublic: args.isPublic,
      createdAt: Date.now(),
    });

    // Insertar canciones
    for (const song of args.songs) {
      await ctx.db.insert("hitsterSongs", {
        deckId,
        ...song,
      });
    }

    return deckId;
  },
});
