/** Score numérico (p. ej. 0–100): como máximo 1 decimal (32,6; no 32,64). */
export function formatScore(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

/** Valor de mercado ya en millones de €: máx. 1 decimal + M€ (p. ej. 180 M€, 62,5 M€). */
export function formatMarketValueMillions(millions: number | null | undefined): string {
  if (millions == null || !Number.isFinite(Number(millions))) return "—";
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(Number(millions))} M€`;
}

export function formatInteger(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
  }).format(Number(value));
}

/** Números grandes (seguidores, vistas) con sufijos compactos en es-ES. */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("es-ES", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value));
}

/**
 * Seguidores estilo 110M, 45M (locale en para sufijos K/M/B sin espacio raro).
 */
export function formatFollowersCompact(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(Number(value));
}

/** Crecimiento absoluto de seguidores en 30d (no es %). Ej: +600K nuevos/mes */
export function formatFollowerGrowthAbsolute(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  const n = Number(value);
  const sign = n >= 0 ? "+" : "−";
  const abs = Math.abs(n);
  const compact = new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(abs);
  return `${sign}${compact} nuevos/mes`;
}

/** Form rating (p. ej. 7.8): siempre 1 decimal, punto como separador decimal. */
export function formatFormRating(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toFixed(1);
}

/** Porcentaje con 1 decimal (p. ej. engagement o crecimiento). */
export function formatPercentValue(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(Number(value))} %`;
}
