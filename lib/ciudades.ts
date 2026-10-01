// ============================================
// CIUDADES — Chismólogo
// ============================================

export const CIUDADES_PRINCIPALES = [
  "Lima",
  "Arequipa",
  "Trujillo",
  "Chiclayo",
  "Piura",
];

export const CIUDADES_SECUNDARIAS = [
  "Cusco",
  "Iquitos",
  "Huancayo",
  "Tacna",
  "Pucallpa",
  "Cajamarca",
  "Chimbote",
  "Huánuco",
  "Ayacucho",
  "Ica",
  "Juliaca",
  "Puno",
  "Tarapoto",
  "Tumbes",
  "Moquegua",
];

export const CIUDADES_INTERNACIONALES = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Quito",
  "Guayaquil",
  "Santiago",
  "Buenos Aires",
  "Montevideo",
  "Asunción",
  "La Paz",
  "Santa Cruz",
  "Caracas",
  "Ciudad de México",
  "Guadalajara",
  "Madrid",
  "Barcelona",
  "Miami",
  "Nueva York",
];

export const TODAS_LAS_CIUDADES = [
  ...CIUDADES_PRINCIPALES,
  ...CIUDADES_SECUNDARIAS,
  ...CIUDADES_INTERNACIONALES,
];

/**
 * Busca coincidencias de ciudades por texto.
 * Devuelve las que empiezan con ese texto o lo contienen.
 */
export function buscarCiudades(query: string, limite = 5): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return TODAS_LAS_CIUDADES.filter((c) =>
    c.toLowerCase().includes(q)
  ).slice(0, limite);
}