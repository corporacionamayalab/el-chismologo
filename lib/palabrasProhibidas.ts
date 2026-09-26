// ==========================================
// 🚫 LISTA DE PALABRAS PROHIBIDAS
// ==========================================
// Cuando agregues palabras, escríbelas en minúsculas,
// sin tildes y sin espacios extra.
// Se detectan automáticamente como subcadenas.
// ==========================================

export const PALABRAS_PROHIBIDAS: string[] = [
  // Groserías / insultos (España/Latam)
  "puta",
  "puto",
  "mierda",
  "coño",
  "joder",
  "pendejo",
  "pendeja",
  "cabron",
  "cabrona",
  "verga",
  "chinga",
  "chingada",
  "pinche",
  "culero",
  "marica",
  "maricon",
  "joto",
  "idiota",
  "imbecil",
  "estupido",
  "estupida",
  "tarado",
  "tarada",
  "retrasado",
  "mongol",
  "subnormal",
  "gilipollas",
  "capullo",
  "hijoputa",
  "hijueputa",
  "malparido",
  "gonorrea",
  "carechimba",
  "hp",
  "ctm",
  "ptm",
  "hdp",
  "lptm",

  // Contenido sexual explícito
  "porno",
  "pornografia",
  "xxx",
  "sexo oral",
  "masturba",
  "pene",
  "vagina",
  "tetas",
  "culos",
  "nalgas",
  "orgia",
  "orgasmo",
  "prostitu",
  "prostituta",
  "putero",
  "pederasta",
  "pedofilo",
  "violacion",
  "violar",
  "violador",
  "zoofilia",
  "incesto",

  // Violencia / amenazas
  "matar",
  "matalo",
  "matarla",
  "asesinar",
  "asesino",
  "suicidate",
  "matate",
  "cortate",
  "muerte a",

  // Drogas (promoción)
  "vender droga",
  "comprar droga",
  "vendo cocaina",
  "vendo marihuana",
  "vendo cristal",
  "vendo meta",
  "vendo fentanilo",

  // Estafas / spam comunes
  "gana dinero facil",
  "dinero rapido",
  "bitcoin gratis",
  "inversion garantizada",
  "hazte rico",
  "click aqui",
  "visita mi web",
  "compra ahora",
  "premio gratis",
  "ganaste un premio",
  "telegram",
  "whatsapp +",
  "invertir en cripto",
  "multiplica tu dinero",
];

// ==========================================
// 🔍 FUNCIÓN: detectar palabras prohibidas
// ==========================================
// Normaliza el texto (minúsculas, sin tildes)
// y busca si contiene alguna palabra prohibida.
// ==========================================

export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9\s]/g, " ") // quita símbolos raros
    .replace(/\s+/g, " ") // espacios múltiples a uno
    .trim();
}

export function contienePalabraProhibida(texto: string): {
  contiene: boolean;
  palabra: string | null;
} {
  const normalizado = normalizarTexto(texto);

  for (const palabra of PALABRAS_PROHIBIDAS) {
    const palabraNorm = normalizarTexto(palabra);
    if (palabraNorm && normalizado.includes(palabraNorm)) {
      return { contiene: true, palabra };
    }
  }

  return { contiene: false, palabra: null };
}