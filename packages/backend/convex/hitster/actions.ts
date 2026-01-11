"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

// Obtener access token de Spotify usando Client Credentials
async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET son requeridos");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Error obteniendo token de Spotify: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Extraer ID de playlist de URL
function extractPlaylistId(urlOrId: string): string {
  // Si es una URL completa, extraer el ID
  const match = urlOrId.match(/playlist\/([a-zA-Z0-9]+)/);
  if (match) {
    return match[1];
  }
  // Si ya es un ID, devolverlo
  return urlOrId;
}

// Obtener preview URL desde la página embed de Spotify
async function fetchPreviewUrl(trackId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://open.spotify.com/embed/track/${trackId}`);
    const html = await res.text();
    const match = html.match(/"audioPreview":\s*\{[^}]*"url":"([^"]+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Extraer año de release_date (puede ser YYYY, YYYY-MM, o YYYY-MM-DD)
function extractYear(releaseDate: string): number {
  return parseInt(releaseDate.substring(0, 4), 10);
}

interface SpotifyTrack {
  track: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
      name: string;
      release_date: string;
      images: Array<{ url: string }>;
    };
    preview_url: string | null;
  } | null;
}

interface SpotifyPlaylistResponse {
  name: string;
  id: string;
  tracks: {
    total: number;
    items: SpotifyTrack[];
    next: string | null;
  };
}

// Fetch playlist completa de Spotify
export const fetchPlaylist = action({
  args: {
    playlistUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{
    name: string;
    playlistId: string;
    totalTracks: number;
    tracksWithPreview: number;
    songs: Array<{
      spotifyTrackId: string;
      name: string;
      artistName: string;
      albumName: string;
      releaseYear: number;
      previewUrl: string;
      coverUrl: string;
    }>;
  }> => {
    const playlistId = extractPlaylistId(args.playlistUrl);
    const token = await getSpotifyToken();

    // Fetch playlist info
    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,id,tracks(total,items(track(id,name,artists(name),album(name,release_date,images),preview_url)),next)`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!playlistResponse.ok) {
      throw new Error(`Error obteniendo playlist: ${playlistResponse.status}`);
    }

    const playlist: SpotifyPlaylistResponse = await playlistResponse.json();

    let allTracks = [...playlist.tracks.items];
    let nextUrl = playlist.tracks.next;

    // Paginar para obtener todas las canciones
    while (nextUrl) {
      const nextResponse = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!nextResponse.ok) break;

      const nextData = await nextResponse.json();
      allTracks = [...allTracks, ...nextData.items];
      nextUrl = nextData.next;

      // Limitar a 150 canciones para no sobrecargar
      if (allTracks.length >= 150) break;
    }

    // Procesar canciones y filtrar las que no tienen preview
    const songs: Array<{
      spotifyTrackId: string;
      name: string;
      artistName: string;
      albumName: string;
      releaseYear: number;
      previewUrl: string;
      coverUrl: string;
    }> = [];

    for (const item of allTracks) {
      if (!item.track) continue;

      const track = item.track;
      let previewUrl = track.preview_url;

      // Si no tiene preview_url, intentar obtenerlo por scraping
      if (!previewUrl) {
        previewUrl = await fetchPreviewUrl(track.id);
      }

      // Solo agregar si tiene preview
      if (previewUrl) {
        songs.push({
          spotifyTrackId: track.id,
          name: track.name,
          artistName: track.artists.map((a) => a.name).join(", "),
          albumName: track.album.name,
          releaseYear: extractYear(track.album.release_date),
          previewUrl,
          coverUrl: track.album.images[0]?.url || "",
        });
      }

      // Limitar a 100 canciones con preview
      if (songs.length >= 100) break;
    }

    return {
      name: playlist.name,
      playlistId: playlist.id,
      totalTracks: playlist.tracks.total,
      tracksWithPreview: songs.length,
      songs,
    };
  },
});

// Crear deck desde playlist
export const createDeckFromPlaylist = action({
  args: {
    playlistUrl: v.string(),
    name: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{
    deckId: string;
    name: string;
    songCount: number;
  }> => {
    // Fetch playlist data directamente (evitar circular reference)
    const playlistId = extractPlaylistId(args.playlistUrl);
    const token = await getSpotifyToken();

    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,id,tracks(total,items(track(id,name,artists(name),album(name,release_date,images),preview_url)),next)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!playlistResponse.ok) {
      throw new Error(`Error obteniendo playlist: ${playlistResponse.status}`);
    }

    const playlist: SpotifyPlaylistResponse = await playlistResponse.json();
    let allTracks = [...playlist.tracks.items];
    let nextUrl = playlist.tracks.next;

    while (nextUrl && allTracks.length < 150) {
      const nextResponse = await fetch(nextUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!nextResponse.ok) break;
      const nextData = await nextResponse.json();
      allTracks = [...allTracks, ...nextData.items];
      nextUrl = nextData.next;
    }

    const songs: Array<{
      spotifyTrackId: string;
      name: string;
      artistName: string;
      albumName: string;
      releaseYear: number;
      previewUrl: string;
      coverUrl: string;
    }> = [];

    for (const item of allTracks) {
      if (!item.track) continue;
      const track = item.track;
      let previewUrl = track.preview_url;
      if (!previewUrl) {
        previewUrl = await fetchPreviewUrl(track.id);
      }
      if (previewUrl && songs.length < 100) {
        songs.push({
          spotifyTrackId: track.id,
          name: track.name,
          artistName: track.artists.map((a) => a.name).join(", "),
          albumName: track.album.name,
          releaseYear: extractYear(track.album.release_date),
          previewUrl,
          coverUrl: track.album.images[0]?.url || "",
        });
      }
    }

    if (songs.length < 30) {
      throw new Error(
        `La playlist necesita al menos 30 canciones con preview. Solo encontramos ${songs.length}.`
      );
    }

    // Crear deck
    const deckId = await ctx.runMutation(internal.hitster.internal.createDeck, {
      name: args.name || playlist.name,
      spotifyPlaylistId: playlist.id,
      spotifyPlaylistUrl: args.playlistUrl,
      songCount: songs.length,
      isPublic: args.isPublic ?? false,
      songs,
    });

    return {
      deckId: deckId as string,
      name: args.name || playlist.name,
      songCount: songs.length,
    };
  },
});
