// src/constants.js

export const ESTADOS_OBRA = {
  EN_CURSO: "en_curso",
  PAUSADA: "pausada",
  FINALIZADA: "finalizada",
};

export const PRIORIDADES = {
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
};

// Configuración visual (Labels y Colores)
export const ESTADO_CONFIG = {
  [ESTADOS_OBRA.EN_CURSO]: { label: "En curso", color: "#4ade80", bg: "#0d2a0d" },
  [ESTADOS_OBRA.PAUSADA]: { label: "Pausada", color: "#fbbf24", bg: "#2a1a0d" },
  [ESTADOS_OBRA.FINALIZADA]: { label: "Finalizada", color: "#60a5fa", bg: "#0d1a2a" },
};