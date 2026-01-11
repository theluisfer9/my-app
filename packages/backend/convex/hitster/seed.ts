import { mutation } from "../_generated/server";

// Playlists predefinidas de Spotify (públicas y populares)
const PREDEFINED_PLAYLISTS = [
  {
    name: "Éxitos de los 80s",
    spotifyPlaylistId: "37i9dQZF1DX4UtSsGT1Sbe", // All Out 80s
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4UtSsGT1Sbe",
  },
  {
    name: "Éxitos de los 90s",
    spotifyPlaylistId: "37i9dQZF1DXbTxeAdrVG2l", // All Out 90s
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DXbTxeAdrVG2l",
  },
  {
    name: "Éxitos de los 2000s",
    spotifyPlaylistId: "37i9dQZF1DX4o1oenSJRJd", // All Out 2000s
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4o1oenSJRJd",
  },
  {
    name: "Rock Clásico",
    spotifyPlaylistId: "37i9dQZF1DWXRqgorJj26U", // Rock Classics
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U",
  },
  {
    name: "Latin Hits",
    spotifyPlaylistId: "37i9dQZF1DX10zKzsJ2jva", // Viva Latino
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DX10zKzsJ2jva",
  },
  {
    name: "Pop Internacional",
    spotifyPlaylistId: "37i9dQZF1DXcBWIGoYBM5M", // Today's Top Hits
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
  },
];

// Esta mutation solo registra las playlists predefinidas en la base de datos
// Las canciones se cargarán cuando se seleccione un deck usando la action
export const seedPredefinedDecks = mutation({
  args: {},
  handler: async (ctx) => {
    const results = [];

    for (const playlist of PREDEFINED_PLAYLISTS) {
      // Verificar si ya existe
      const existing = await ctx.db
        .query("hitsterDecks")
        .withIndex("by_playlist", (q) =>
          q.eq("spotifyPlaylistId", playlist.spotifyPlaylistId)
        )
        .first();

      if (existing) {
        results.push({
          name: playlist.name,
          status: "already_exists",
          deckId: existing._id,
        });
        continue;
      }

      // Crear placeholder del deck (sin canciones aún)
      // Las canciones se cargarán cuando se use el deck
      const deckId = await ctx.db.insert("hitsterDecks", {
        name: playlist.name,
        spotifyPlaylistId: playlist.spotifyPlaylistId,
        spotifyPlaylistUrl: playlist.spotifyPlaylistUrl,
        songCount: 0, // Se actualizará al cargar
        createdBy: "system",
        isPublic: true,
        createdAt: Date.now(),
      });

      results.push({
        name: playlist.name,
        status: "created",
        deckId,
      });
    }

    return results;
  },
});
