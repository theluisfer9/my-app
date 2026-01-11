import { mutation } from "../_generated/server";

// IDs de playlists viejas a eliminar (para limpiar decks con datos incorrectos)
const OLD_PLAYLIST_IDS = [
  // Editoriales de Spotify (no funcionan con Client Credentials)
  "37i9dQZF1DX4UtSsGT1Sbe",
  "37i9dQZF1DXbTxeAdrVG2l",
  "37i9dQZF1DX4o1oenSJRJd",
  "37i9dQZF1DWXRqgorJj26U",
  "37i9dQZF1DX10zKzsJ2jva",
  "37i9dQZF1DXcBWIGoYBM5M",
  // Playlists anteriores que tenían años incorrectos
  "0RJYbgmSQULVMK48M1MHud",
  "3C64V048fGyQfCjmu9TIGA",
  "6b2dBnxolvwV2L1L4thWRm",
  "4iXi24GdAEXnMUFfdKJ4dh",
  "1lvD3XTXCHx0VjXNbl49XF",
  "5h166CoTrCt89sPCPVz3hW", // Se recargará con años corregidos
];

// Eliminar decks con playlists que ya no funcionan
export const cleanupOldDecks = mutation({
  args: {},
  handler: async (ctx) => {
    const deleted = [];
    for (const playlistId of OLD_PLAYLIST_IDS) {
      const deck = await ctx.db
        .query("hitsterDecks")
        .withIndex("by_playlist", (q) => q.eq("spotifyPlaylistId", playlistId))
        .first();

      if (deck) {
        // Eliminar canciones del deck
        const songs = await ctx.db
          .query("hitsterSongs")
          .withIndex("by_deck", (q) => q.eq("deckId", deck._id))
          .collect();

        for (const song of songs) {
          await ctx.db.delete(song._id);
        }

        // Eliminar el deck
        await ctx.db.delete(deck._id);
        deleted.push(deck.name);
      }
    }
    return { deleted };
  },
});

// Playlists predefinidas de Spotify (curadas manualmente)
const PREDEFINED_PLAYLISTS = [
  // 80s
  {
    name: "80s en Inglés",
    spotifyPlaylistId: "5xvyjvYdBb1jEDvwhQdEOY",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/5xvyjvYdBb1jEDvwhQdEOY",
  },
  {
    name: "80s en Español",
    spotifyPlaylistId: "21P7VOec1gvIgY2OIc6eqZ",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/21P7VOec1gvIgY2OIc6eqZ",
  },
  // 90s
  {
    name: "90s en Inglés",
    spotifyPlaylistId: "79h9jJSvbOd8Lm58S0jEX6",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/79h9jJSvbOd8Lm58S0jEX6",
  },
  {
    name: "90s en Español",
    spotifyPlaylistId: "5QMzMqrZx2EpjF21zkD5L3",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/5QMzMqrZx2EpjF21zkD5L3",
  },
  // 2000s
  {
    name: "2000s en Inglés",
    spotifyPlaylistId: "5h166CoTrCt89sPCPVz3hW",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/5h166CoTrCt89sPCPVz3hW",
  },
  {
    name: "2000s en Español",
    spotifyPlaylistId: "7oq24EUVDxvrfpU4fzbLcy",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/7oq24EUVDxvrfpU4fzbLcy",
  },
  // Rock
  {
    name: "Rock Clásico en Inglés",
    spotifyPlaylistId: "4d7g5e0CIhDZJZXaLkBEHM",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/4d7g5e0CIhDZJZXaLkBEHM",
  },
  {
    name: "Rock Clásico en Español",
    spotifyPlaylistId: "5Z6J7jqK6oF7upv8KhZuds",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/5Z6J7jqK6oF7upv8KhZuds",
  },
  // Géneros
  {
    name: "Reggaetón Clásico",
    spotifyPlaylistId: "3LTP24145T1C09LYlSZrWE",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/3LTP24145T1C09LYlSZrWE",
  },
  {
    name: "Pop en Español",
    spotifyPlaylistId: "3H7Q09f16faqyDJwsx6adp",
    spotifyPlaylistUrl: "https://open.spotify.com/playlist/3H7Q09f16faqyDJwsx6adp",
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
