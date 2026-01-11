import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Espectros/pistas del juego Wavelength
  spectrums: defineTable({
    leftLabel: v.string(), // Ej: "Animal feo"
    rightLabel: v.string(), // Ej: "Animal bonito"
    category: v.string(), // Ej: "Cotidiano", "Abstracto", "Cultura"
    isActive: v.boolean(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // Salas de juego
  rooms: defineTable({
    name: v.string(),
    code: v.string(), // Código único de 5 caracteres
    hostId: v.string(), // ID del usuario host
    isPrivate: v.boolean(),
    password: v.optional(v.string()),
    // Modo de juego: individual (todos vs todos) o teams (equipos)
    gameMode: v.union(v.literal("individual"), v.literal("teams")),
    status: v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    ),
    currentRound: v.number(),
    totalRounds: v.number(),
    totalScore: v.number(), // Solo se usa en modo teams
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_host", ["hostId"])
    .index("by_status", ["status"]),

  // Jugadores en sala
  players: defineTable({
    roomId: v.id("rooms"),
    userId: v.string(), // ID del usuario (better-auth)
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    isHost: v.boolean(),
    isConnected: v.boolean(),
    // Puntuación individual acumulada (modo individual)
    score: v.number(),
    // Equipo asignado (modo teams): 0 = sin equipo, 1 = equipo 1, 2 = equipo 2
    team: v.optional(v.number()),
    joinedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  // Rondas del juego
  rounds: defineTable({
    roomId: v.id("rooms"),
    roundNumber: v.number(),
    spectrumId: v.id("spectrums"),
    psychicId: v.string(), // ID del jugador psíquico
    targetPosition: v.number(), // 0-100
    clue: v.optional(v.string()),
    guessPosition: v.optional(v.number()),
    pointsEarned: v.optional(v.number()),
    status: v.union(
      v.literal("psychic_turn"),
      v.literal("guessing"),
      v.literal("results"),
      v.literal("completed")
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_number", ["roomId", "roundNumber"]),

  // Posiciones de adivinanza en tiempo real (por jugador por ronda)
  playerGuesses: defineTable({
    roundId: v.id("rounds"),
    userId: v.string(), // ID del usuario
    position: v.number(), // 0-100 (posición actual del dial)
    // Datos finales cuando confirma su guess
    finalPosition: v.optional(v.number()), // Posición confirmada
    pointsEarned: v.optional(v.number()), // Puntos ganados en esta ronda
    confirmedAt: v.optional(v.number()), // Timestamp cuando confirmó
    updatedAt: v.number(),
  })
    .index("by_round", ["roundId"])
    .index("by_round_and_user", ["roundId", "userId"]),

  // ============================================
  // HITSTER - Juego de Timeline Musical
  // ============================================

  // Decks de canciones (playlists de Spotify procesadas)
  hitsterDecks: defineTable({
    name: v.string(),
    spotifyPlaylistId: v.string(),
    spotifyPlaylistUrl: v.optional(v.string()),
    songCount: v.number(),
    createdBy: v.string(), // userId
    isPublic: v.boolean(), // true para decks predefinidos
    createdAt: v.number(),
  })
    .index("by_playlist", ["spotifyPlaylistId"])
    .index("by_public", ["isPublic"]),

  // Canciones del deck
  hitsterSongs: defineTable({
    deckId: v.id("hitsterDecks"),
    spotifyTrackId: v.string(),
    name: v.string(),
    artistName: v.string(),
    albumName: v.string(),
    releaseYear: v.number(),
    previewUrl: v.string(), // required - canciones sin preview son filtradas
    coverUrl: v.string(),
  })
    .index("by_deck", ["deckId"]),

  // Salas de juego Hitster
  hitsterRooms: defineTable({
    name: v.string(),
    code: v.string(), // Código único 5 chars
    hostId: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("loading"), // cargando playlist
      v.literal("playing"),
      v.literal("finished")
    ),
    deckId: v.optional(v.id("hitsterDecks")), // Legacy - single deck
    deckIds: v.optional(v.array(v.id("hitsterDecks"))), // Multi-deck support
    spotifyPlaylistUrl: v.optional(v.string()), // URL antes de procesar
    cardsToWin: v.number(), // 6, 8, 10
    turnTimeLimit: v.optional(v.number()), // segundos o null = sin límite
    gameMode: v.optional(v.union(v.literal("remote"), v.literal("group"))), // remote = todos escuchan, group = solo jugador activo
    currentPlayerIndex: v.number(),
    playerOrder: v.array(v.string()), // userIds en orden de turno
    deckCardIds: v.array(v.id("hitsterSongs")), // Deck barajado
    currentCardIndex: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_host", ["hostId"])
    .index("by_status", ["status"]),

  // Jugadores en sala Hitster
  hitsterPlayers: defineTable({
    roomId: v.id("hitsterRooms"),
    userId: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    isHost: v.boolean(),
    isConnected: v.boolean(),
    score: v.number(),
    timeline: v.array(
      v.object({
        songId: v.id("hitsterSongs"),
        year: v.number(),
        isInitial: v.optional(v.boolean()),
      })
    ),
    joinedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_user", ["roomId", "userId"]),

  // Turno actual en Hitster
  hitsterTurns: defineTable({
    roomId: v.id("hitsterRooms"),
    playerId: v.id("hitsterPlayers"),
    songId: v.id("hitsterSongs"),
    phase: v.union(
      v.literal("listening"),
      v.literal("placing"),
      v.literal("revealing"),
      v.literal("bonus"),
      v.literal("result")
    ),
    placedAtIndex: v.optional(v.number()),
    isCorrect: v.optional(v.boolean()),
    artistGuess: v.optional(v.string()),
    songGuess: v.optional(v.string()),
    artistCorrect: v.optional(v.boolean()),
    songCorrect: v.optional(v.boolean()),
    pointsEarned: v.number(),
    startedAt: v.number(),
    phaseStartedAt: v.number(),
  })
    .index("by_room", ["roomId"]),
});
