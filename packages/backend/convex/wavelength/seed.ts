import { mutation } from "../_generated/server";

const INITIAL_SPECTRUMS = [
  // Abstracto
  { leftLabel: "Caos", rightLabel: "Orden", category: "Abstracto" },
  { leftLabel: "Objetivo", rightLabel: "Subjetivo", category: "Abstracto" },
  { leftLabel: "Simple", rightLabel: "Complejo", category: "Abstracto" },
  { leftLabel: "Justo", rightLabel: "Injusto", category: "Abstracto" },
  { leftLabel: "Realista", rightLabel: "Fantasioso", category: "Abstracto" },
  { leftLabel: "Ético", rightLabel: "No ético", category: "Abstracto" },
  { leftLabel: "Natural", rightLabel: "Artificial", category: "Abstracto" },
  { leftLabel: "Predecible", rightLabel: "Impredecible", category: "Abstracto" },
  { leftLabel: "Profundo", rightLabel: "Superficial", category: "Abstracto" },

  // Personalidad
  { leftLabel: "Introvertido", rightLabel: "Extrovertido", category: "Personalidad" },
  { leftLabel: "Educado", rightLabel: "Grosero", category: "Personalidad" },
  { leftLabel: "Aburrido", rightLabel: "Emocionante", category: "Personalidad" },
  { leftLabel: "Normal", rightLabel: "Extraño", category: "Personalidad" },
  { leftLabel: "Seguro", rightLabel: "Arriesgado", category: "Personalidad" },
  { leftLabel: "Serio", rightLabel: "Ridículo", category: "Personalidad" },
  { leftLabel: "Amigable", rightLabel: "Hostil", category: "Personalidad" },
  { leftLabel: "Popular", rightLabel: "Desconocido", category: "Personalidad" },

  // Comida y Gustos
  { leftLabel: "Sobrevalorado", rightLabel: "Infravalorado", category: "Gustos" },
  { leftLabel: "Rico", rightLabel: "Asqueroso", category: "Gustos" },
  { leftLabel: "Saludable", rightLabel: "Poco saludable", category: "Gustos" },
  { leftLabel: "Tradicional", rightLabel: "Moderno", category: "Gustos" },
  { leftLabel: "Casero", rightLabel: "Comercial", category: "Gustos" },
  { leftLabel: "Gourmet", rightLabel: "Simple", category: "Gustos" },
  { leftLabel: "Moda pasajera", rightLabel: "Atemporal", category: "Gustos" },

  // Gaming
  { leftLabel: "Casual", rightLabel: "Hardcore", category: "Gaming" },
  { leftLabel: "Lento", rightLabel: "Rápido", category: "Gaming" },
  { leftLabel: "Anticuado", rightLabel: "Futurista", category: "Gaming" },
  { leftLabel: "Indie", rightLabel: "Mainstream", category: "Gaming" },
  { leftLabel: "Original", rightLabel: "Copia", category: "Gaming" },
  { leftLabel: "Buggy", rightLabel: "Pulido", category: "Gaming" },

  // Emociones
  { leftLabel: "Inofensivo", rightLabel: "Ofensivo", category: "Emociones" },
  { leftLabel: "Frío", rightLabel: "Caliente", category: "Emociones" },
  { leftLabel: "Relajante", rightLabel: "Estresante", category: "Emociones" },
  { leftLabel: "Inteligente", rightLabel: "Tonto", category: "Emociones" },
  { leftLabel: "Elegante", rightLabel: "Vulgar", category: "Emociones" },
  { leftLabel: "Frustrante", rightLabel: "Satisfactorio", category: "Emociones" },

  // Confianza
  { leftLabel: "Confiable", rightLabel: "Sospechoso", category: "Confianza" },
  { leftLabel: "Sincero", rightLabel: "Falso", category: "Confianza" },
  { leftLabel: "Inspirador", rightLabel: "Deprimente", category: "Confianza" },
  { leftLabel: "Seguro de sí mismo", rightLabel: "Inseguro", category: "Confianza" },
  { leftLabel: "Motivador", rightLabel: "Desmotivador", category: "Confianza" },
  { leftLabel: "Empático", rightLabel: "Insensible", category: "Confianza" },

  // Filosofía
  { leftLabel: "Libre", rightLabel: "Controlado", category: "Filosofía" },
  { leftLabel: "Necesario", rightLabel: "Innecesario", category: "Filosofía" },
  { leftLabel: "Auténtico", rightLabel: "Artificial", category: "Filosofía" },
  { leftLabel: "Significativo", rightLabel: "Irrelevante", category: "Filosofía" },
  { leftLabel: "Poderoso", rightLabel: "Débil", category: "Filosofía" },
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
