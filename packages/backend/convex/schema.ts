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
});
