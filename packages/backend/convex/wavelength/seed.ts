import { mutation } from "../_generated/server";

const INITIAL_SPECTRUMS = [
  // Cotidiano
  { leftLabel: "Frío", rightLabel: "Caliente", category: "Cotidiano" },
  { leftLabel: "Animal feo", rightLabel: "Animal bonito", category: "Cotidiano" },
  { leftLabel: "Mala película", rightLabel: "Buena película", category: "Cotidiano" },
  { leftLabel: "Aburrido", rightLabel: "Emocionante", category: "Cotidiano" },
  { leftLabel: "Comida mala", rightLabel: "Comida deliciosa", category: "Cotidiano" },
  { leftLabel: "Barato", rightLabel: "Caro", category: "Cotidiano" },
  { leftLabel: "Suave", rightLabel: "Áspero", category: "Cotidiano" },
  { leftLabel: "Lento", rightLabel: "Rápido", category: "Cotidiano" },
  { leftLabel: "Pequeño", rightLabel: "Grande", category: "Cotidiano" },
  { leftLabel: "Viejo", rightLabel: "Nuevo", category: "Cotidiano" },
  { leftLabel: "Silencioso", rightLabel: "Ruidoso", category: "Cotidiano" },
  { leftLabel: "Ligero", rightLabel: "Pesado", category: "Cotidiano" },

  // Abstracto
  { leftLabel: "Triste", rightLabel: "Feliz", category: "Abstracto" },
  { leftLabel: "Simple", rightLabel: "Complejo", category: "Abstracto" },
  { leftLabel: "Introvertido", rightLabel: "Extrovertido", category: "Abstracto" },
  { leftLabel: "Malo", rightLabel: "Bueno", category: "Abstracto" },
  { leftLabel: "Común", rightLabel: "Raro", category: "Abstracto" },
  { leftLabel: "Inútil", rightLabel: "Útil", category: "Abstracto" },
  { leftLabel: "Olvidable", rightLabel: "Memorable", category: "Abstracto" },
  { leftLabel: "Fácil", rightLabel: "Difícil", category: "Abstracto" },
  { leftLabel: "Aburrido", rightLabel: "Divertido", category: "Abstracto" },
  { leftLabel: "Seguro", rightLabel: "Peligroso", category: "Abstracto" },

  // Cultura y Opinión
  { leftLabel: "Villano", rightLabel: "Héroe", category: "Cultura" },
  { leftLabel: "Subestimado", rightLabel: "Sobrevalorado", category: "Cultura" },
  { leftLabel: "Retro", rightLabel: "Moderno", category: "Cultura" },
  { leftLabel: "Para niños", rightLabel: "Para adultos", category: "Cultura" },
  { leftLabel: "Realista", rightLabel: "Fantástico", category: "Cultura" },
  { leftLabel: "Normal", rightLabel: "Raro", category: "Cultura" },
  { leftLabel: "Fracaso", rightLabel: "Éxito", category: "Cultura" },
];

export const seedSpectrums = mutation({
  args: {},
  handler: async (ctx) => {
    // Verificar si ya hay espectros
    const existing = await ctx.db.query("spectrums").first();
    if (existing) {
      return { message: "Los espectros ya fueron sembrados", count: 0 };
    }

    let count = 0;
    for (const spectrum of INITIAL_SPECTRUMS) {
      await ctx.db.insert("spectrums", {
        ...spectrum,
        isActive: true,
      });
      count++;
    }

    return { message: `Se sembraron ${count} espectros`, count };
  },
});

// Mutation para agregar espectros manualmente
export const addSpectrum = mutation({
  args: {},
  handler: async (ctx) => {
    // Esta mutation está vacía pero puede usarse para agregar espectros desde el dashboard
    return { message: "Usa el dashboard de Convex para agregar espectros" };
  },
});
